package com.mymessagebroker.firstmessagebroker.config;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.mymessagebroker.firstmessagebroker.dto.ChatModel;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HandleDisconnected {

    SimpMessageSendingOperations sending;

    @EventListener
    public void handleDisconnected(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String username = (String)headerAccessor.getSessionAttributes().get("username");
        if (username != null) {
            ChatModel chatModel = ChatModel.builder()
                    .message("User "+username+" has left the chat")
                    .sender(username)
                    .type("LEAVE")
                    .build();
            sending.convertAndSend("/topic/public", chatModel);
        }
    }

}
