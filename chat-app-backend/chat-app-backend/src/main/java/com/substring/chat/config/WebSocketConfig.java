package com.substring.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer
{
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config)
    {   //this method is used for routing messages and  configures message broker

        //enables simple in memory message broker
        //message comming from server are published or routed on destination prefix "topic"
        // /topic/messages
        config.enableSimpleBroker("/topic");

        // set prefix for messages handled by server side controller
        config.setApplicationDestinationPrefixes("/app");
        // /app/chat
        // server-side: @MessagingMapping("/chat")

    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
       registry.addEndpoint("/chat")    //connecton is established on /chat endpoint
               .setAllowedOrigins("http://localhost:5173")
               .withSockJS();       //provide fall back mechanism for web socket
    }
}
