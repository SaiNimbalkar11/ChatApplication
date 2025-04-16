package com.substring.chat.repositories;

import com.substring.chat.entities.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

//this interface interacts with room type objects having id of String type so <Room,String> is used
public interface RoomRepository extends MongoRepository<Room,String> {
    //get room using room id
    Room findByRoomId(String roomId); //used to get user room using room id


}
