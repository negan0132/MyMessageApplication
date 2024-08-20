package com.mymessagebroker.firstmessagebroker.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.mymessagebroker.firstmessagebroker.dto.ChatModel;

@Controller
public class MainController {

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatModel sendMessage(@Payload ChatModel chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatModel addUser(
        @Payload ChatModel message, 
        SimpMessageHeaderAccessor headerAccessor) 
    {
        headerAccessor.getSessionAttributes().put("username", message.getSender());
        return message;
    }

}
