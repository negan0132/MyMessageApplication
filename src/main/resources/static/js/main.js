'use strict';

let initPage = $('#username-page');
let chatHeader = $('.chat-header');
let initForm = $('#usernameForm');
let nameOfUser = $('#name');
let chatForm = $('#messageForm');
let chatInput = $('#message');
let showMessages = $('#messageArea');
let loadingConnect = $('.connecting');

var stompProtocol = null;
var username = null;

/**
 * Random color for user
 */
var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0', 
    '#F0A8D0','#D1E9F6','#F4DEB3', '#C0C78C', 
    '#708871', '#B1AFFF', '#A87676'
];

let background_color = null;
function getAvatarColor() {
    let sizing = colors.length;
    background_color = colors[Math.floor(Math.random() * sizing)];
    return background_color;
}

/**
 * Handle when data come from backend
 * @param {message} message 
 */
function subcribeMethod(message) {
    let chatModel = JSON.parse(message.body);
    let messageElement = $('<li>');

    if (chatModel.type === 'JOIN') {
        console.log("join: " + chatModel.sender);
        messageElement.addClass('event-message');
        messageElement.text(chatModel.message);
        showMessages.append(messageElement);
    } else if (chatModel.type === 'LEAVE') {
        messageElement.addClass('event-message');
        messageElement.text(chatModel.message);
        showMessages.append(messageElement);
    } else {
        messageElement.addClass('chat-message');

        // Add avatar
        let avatarElement = $('<i>');
        var avatarText = document.createTextNode(chatModel.sender[0]);
        avatarElement.append(avatarText);
        avatarElement.css('background-color', chatModel.background_code);
        messageElement.append(avatarElement);
        let contentElement = $('<span class="content">');
        contentElement.text(chatModel.message);
        messageElement.append(contentElement);
        showMessages.append(messageElement);
        showMessages[0].scrollTop = showMessages[0].scrollHeight;
        chatInput.val('');
        chatInput.focus();
    }
}

/**
 * After connection success
 */
function onConnected() {
    initPage.addClass('hidden');
    loadingConnect.addClass('hidden');
    showMessages.removeClass('hidden');
    chatHeader.removeClass('hidden');
    chatForm.removeClass('hidden');
    chatInput.focus();

    // Subscribe to the Public Topic
    stompProtocol.subscribe('/topic/public', subcribeMethod);

    // Send your account to the backend
    stompProtocol.send("/app/chat.addUser",
        {},
        JSON.stringify({
            sender: username,
            type: 'JOIN',
            background_code: background_color == null ? getAvatarColor() : background_color,
            message: `${username} has joined`
        })
    );
}

/**
 * Handle when connection fail !
 * @param {*} error 
 */
function onError(error) {
    console.log(error);
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

/**
 * Business Logic when the first form is submitted
*/
function connectional(e) {
    username = nameOfUser.val().trim();

    if (username) {
        initPage.addClass('hidden');
        $('#chat-page').removeClass('hidden');
        loadingConnect.removeClass('hidden');
        let socket = new SockJS('/ws');
        stompProtocol = Stomp.over(socket);
        stompProtocol.connect({}, onConnected, onError);
    }
    e.preventDefault();
}

/**
 * Send message content to backend
 * @param {*} sk 
 */
function sendMessage(sk) {
    if (!chatInput.val().trim()) {
        console.log("Input message is empty.");
    } else if (!stompProtocol) {
        console.log("stompProtocol undifined");
    } else if (!stompProtocol.connected) {
        console.log("WebSocket connection is not established yet.");
        console.log(stompProtocol);
    } else {
        // Send Message
        stompProtocol.send(
            "/app/chat.sendMessage",
            {},
            JSON.stringify({
                sender: username,
                type: 'CHAT',
                message: chatInput.val().trim(),
                background_code: background_color
            })
        );

        chatInput.val('');
    }
    
    sk.preventDefault();
}

/**
 * Handle SUbmit of the First Form
*/
initForm.on('submit', connectional);

/**
 * Handle Submit of the Message Form
 */
chatForm.on('submit', sendMessage);


