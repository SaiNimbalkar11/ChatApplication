import React, { useEffect, useRef, useState } from 'react'
import { MdAttachFile, MdSend } from 'react-icons/md';
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';
import SockJS from 'sockjs-client';
import { baseURL } from '../config/AxiosHelper';
import { Client, Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { getMessagess } from '../services/RoomService';
import { timeAgo } from '../config/helper';
import EmojiPicker from 'emoji-picker-react';
import { MdEmojiEmotions } from 'react-icons/md';

const ChatPage = () => {

    const {roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser} = useChatContext();
    //console.log(roomId);
    //console.log(currentUser);
    //console.log(connected);

    const navigate = useNavigate();

    useEffect(() => {
        if(!connected){
            navigate("/");
        }
    },[connected,roomId,currentUser]);


    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);
    const [stompClient, setStompClient] = useState(null);

    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
 
     //page init:
    //Need to load the message
    useEffect(()=>{
        async function loadMessages(){

            try{

                const messages = await getMessagess(roomId);
                //console.log(messages);
                setMessages(messages)

            }catch(error){

            }


        }

        if(connected)
        {
            loadMessages();
        }
        
    },[]);

    //scroll down
    useEffect(()=>{

        if(chatBoxRef.current){

            chatBoxRef.current.scroll({
                top:chatBoxRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    },[messages]);


    //Need to init stompClient
        //subscribe

      useEffect(()=>{
            const connectWebSocket=()=>{

                //SockJS obj

                const sock = new SockJS(`${baseURL}/chat`);

                const client = Stomp.over(sock);

                client.connect({}, () => {


                    setStompClient(client);


                    toast.success("connected");


                    client.subscribe(`/topic/room/${roomId}`, (message)=>{

                        console.log(message);

                        const newMessage = JSON.parse(message.body);

                        setMessages((prev)=> [...prev, newMessage]);

                        //rest of the work after success receiving the message
                    });

                });

            };

            if(connected){
                connectWebSocket();

            }

           
        //stomp client
        },[roomId]);

        
    //send message handle
    const sendMessage = async () =>{
        if(stompClient && connected && input.trim() )
        {
            console.log(input);   

            const message ={
                sender: currentUser,
                content: input,
                roomId: roomId
            }

            stompClient.send(`/app/sendMessage/${roomId}`,{},JSON.stringify(message));
            setInput("");

        }
    }

    const handleEmojiClick = (emojiData) => {
        setInput(prev => prev + emojiData.emoji);
    };

    //handle logout button
    function handleLogout(){
        stompClient.disconnect();
        setConnected(false);
        setRoomId("");
        setCurrentUser("");
        navigate("/");
    }

   useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        toast.error("Your browser does not support Speech Recognition");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + " " + transcript);
    };

    recognition.onend = () => {
        setIsRecording(false);
    };

    recognitionRef.current = recognition;
    }, []);
    
    const handleMic = () => {
        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };


  return (
    <div className="">

        {/*This is the header */}
        <header className="dark:border-gray-700 fixed w-full dark:bg-gray-900 py-5 shadow flex justify-around items-center">
            
            {/*roo name container*/}
            <div>
                <h1 className="text-xl font-semibold">
                    Room: <span>{roomId}</span>
                </h1>
            </div>

            {/*username container */}
            <div>
               <h1 className="text-xl font-semibold">
                    User: <span>{currentUser}</span>
                </h1>
            </div>

            {/*button: leave room */}
            <div>
                <button
                onClick={handleLogout} 
                className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full">
                    Leave Room
                </button>
            </div>
        </header>


        {/*main content page */}
        <main
        ref={chatBoxRef} 
        className="py-20  px-10 w-2/3 dark:bg-slate-700 mx-auto h-screen overflow-auto">
        
        {
            messages.map((message,index)=>(
               <div 
                key={index} 
                className={`flex ${message.sender === currentUser ? "justify-end":"justify-start"}`}>

                    <div className={`my-2 ${message.sender === currentUser ? "bg-green-800":"bg-gray-800"} p-2 max-w-xs rounded`}>
                        <div className="flex flex-row gap-2">
                          
                                <img 
                                    className="h-10 w-10 rounded-full border-1 border-white" 
                                    src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${message.sender}&eyes=happy&mouth=smile`} 
                                    alt={message.sender}
                                />                                                    
                                <div className="flex flex-col gap-1">
                                     <p className="text-sm font-bold">{message.sender}</p>
                                     <p>{message.content}</p>
                                     <p className="text-xs text-gray-400">{timeAgo(message.timeStamp)}</p>
                                </div>
                        </div>
                   </div>
               </div>

            ))
        }

        </main>
        

        {/*input message container*/}
        <div className="fixed bottom-4 w-full h-16">
            <div className="h-full pr-10 gap-4 flex items-center justify-between rounded-full w-1/2 mx-auto dark:bg-gray-900">
                <input 
                value={input}
                onChange={(e)=>{
                    setInput(e.target.value);
                }}
                onKeyDown={(e)=>{
                    if(e.key === "Enter"){
                        sendMessage();
                    }
                }}
                type="text" 
                placeholder="Type your message here..." 
                className="dark:border-gray-600 w-full dark:bg-gray-800 px-5 py-2 rounded-full h-full focus:outline-none"
                />

                
                {/*Emoji button*/}
                <div className="flex gap-2">
                <button 
                    onClick={() => setShowEmojiPicker(prev => !prev)} 
                    className="dark:bg-gray-600 h-10 w-10 flex justify-center items-center rounded-full"
                >
                    <MdEmojiEmotions size={22} />
                </button>
               

                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="absolute bottom-14 right-0 z-50">
                        <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                    </div>
                )}

          
                <button 
                    onClick={handleMic}
                    className={`h-10 w-10 flex justify-center items-center rounded-full ${isRecording ? "dark:bg-red-600" : "dark:bg-gray-600"}`}>
                    🎤
                </button>

              
            {/*
                </div>
                <div className="flex gap-2">
                <button className="dark:bg-gray-800 h-10 w-10 flex justify-center items-center rounded-full">
                <MdAttachFile size={20} />
                </button>
            */}

                <button
                 onClick={sendMessage}
                 className="dark:bg-green-600 h-10 w-10 flex justify-center items-center rounded-full">
                <MdSend size={20} />
                </button>
                </div>
                
            </div>
        </div>

    </div>
  );
};

export default ChatPage
