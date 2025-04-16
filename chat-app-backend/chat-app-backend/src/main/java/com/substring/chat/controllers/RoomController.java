package com.substring.chat.controllers;

import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;

import com.substring.chat.repositories.RoomRepository;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin("http://localhost:5173")
public class RoomController {

   //we use  room repositories inside controller
    private RoomRepository roomRepository;
    //create constructor and inject RoomRepository
    public RoomController(RoomRepository roomRepository)
    {
        this.roomRepository=roomRepository;
    }

    //create room
    //Crete room using room Id from user
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId)
    {
        //ResponseEntity<?> used to return multiple type of data
        //check if room already exist
        if(roomRepository.findByRoomId(roomId)!=null)
        {
            //room already exist as roomId is present
            //Return this message if room exist
            return ResponseEntity.badRequest().body("Room already exists!");
        }

        //Create new room
        //If room does not exist if room is null
        Room room = new Room();
        room.setRoomId(roomId);
        Room savedRoom = roomRepository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }



    //get room : join
    //to join room check if room exist
    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(
            @PathVariable String roomId
    ){
        Room room = roomRepository.findByRoomId(roomId);

        if(room==null)
        {
            return ResponseEntity.badRequest()
                    .body("Room not found!!");
        }
        return ResponseEntity.ok(room);
    }


   //get messages of room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>>  getMessages(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "20", required = false) int size
    ) {
        Room room = roomRepository.findByRoomId(roomId);
        //Check if room is empty
        if (room == null) {
            return ResponseEntity.badRequest().build()
                    ;
        }
        //get messages :
        //pagination
        List<Message> messages = room.getMessages();
        int start = Math.max(0, messages.size() - (page + 1) * size);
        int end = Math.min(messages.size(), start + size);

        List<Message> paginatedMessages = messages.subList(start, end);


        return ResponseEntity.ok(paginatedMessages);

    }


}