package com.substring.chat.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;



@Document(collection = "rooms") //used to map object of  room entity to document  which is in collection room and connect with mongodb
@Getter
@Setter
@NoArgsConstructor  //default constructor
@AllArgsConstructor

//create chat room
public class Room {
    @Id
    private String id; //Mongo db : unique identifier
    private String roomId;  //user will create its own room Id
    private List<Message> messages = new ArrayList<>(); //store list of messages in the room as an array list


}
