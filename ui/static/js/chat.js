document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.sidebar .user').forEach(user => {
        user.addEventListener('click', () => addChatBlock(user.textContent));
    });
});

function addChat(userName) {
    console.log('clicked', userName);
    const chatArea = document.getElementById("chatsContainer");
    const chatBlockId = 'chatblock-' + userName.replace(/\s+/g, '-').toLowerCase();
    if (document.getElementById(chatBlockId)) {
        console.log('This chat is already open.');
        return;
    }
    const existingChatBlocks = chatArea.getElementsByClassName('chatblock').length;
    if (existingChatBlocks >= 2) {
        console.log('You need to close a chat before opening a new one.');
        return;
    } else {

        const chatBlock = document.createElement('div');
        chatBlock.classList.add('chatblock');
        chatBlock.id = chatBlockId;

        const chatHeader = document.createElement('div');
        chatHeader.classList.add('chatHeader')

        const chatIcon = document.createElement('img');
        chatIcon.setAttribute('src', '../static/media/user.png');
        chatIcon.classList.add('chatIcon', 'invert', 'user')
        chatHeader.appendChild(chatIcon)

        const chatOnlineCircle = document.createElement('span');
        chatOnlineCircle.className = 'chatOnlineCircle';
        chatHeader.appendChild(chatOnlineCircle);

        const chatUsername = document.createElement('p');
        chatUsername.className = 'chatUsername';
        chatUsername.textContent = userName;
        chatHeader.appendChild(chatUsername);

        const chatControl = document.createElement('div');
        chatControl.className = 'chatControl';

        const closeButton = document.createElement('span');
        closeButton.className = 'chatbtn close-btn';
        chatControl.appendChild(closeButton);

        const minButton = document.createElement('span');
        minButton.className = 'chatbtn min-btn';
        chatControl.appendChild(minButton);

        const maxButton = document.createElement('span');
        maxButton.className = 'chatbtn max-btn';
        chatControl.appendChild(maxButton);

        // Append chatControl to chatHeader
        chatHeader.appendChild(chatControl);

        const chatSeparation = document.createElement('span');
        chatSeparation.className = 'chatsperation';
        chatHeader.appendChild(chatSeparation);

        chatBlock.appendChild(chatHeader)

        const chatdiv = document.createElement('div');
        chatdiv.className = 'chatdiv';
        chatBlock.appendChild(chatdiv);

        const inputDiv = document.createElement('div');
        inputDiv.className = 'inputdiv';


        const textarea = document.createElement('textarea');
        textarea.setAttribute('type', 'text');
        textarea.id = 'chatinput';
        textarea.className = 'chatinput';
        textarea.placeholder = 'Write a comment';
        inputDiv.appendChild(textarea);

        const button = document.createElement('button');
        button.id = 'sendChat';
        button.className = 'sendChat';
        button.setAttribute('type', 'button');
        button.addEventListener('click', function () {
            sendChatMessage(textarea, chatdiv);
        });
        inputDiv.appendChild(button);
        chatBlock.appendChild(inputDiv);
        chatArea.appendChild(chatBlock);
    }
}


function closeChat(event) {
    const chatBlock = event.target.closest('.chatblock');
    chatBlock.style.animation = 'closechat 0.5s ease-in-out forwards';
    if (chatBlock) {
        setTimeout(() => {

            chatBlock.remove();
        }, 1000);
    }

}

document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('close-btn')) {
        closeChat(e);
    }
});

function sendChatMessage(textarea, chatdiv) {
    // Create the chat message container
    const messageDiv = document.createElement('div');
    messageDiv.className = 'textchatdiv rightchat'; // Use 'leftchat' for messages from others

    // Create and append the text message paragraph
    const messageText = document.createElement('p');
    messageText.className = 'textchat';
    messageText.textContent = textarea.value; // Use the textarea's current value
    messageDiv.appendChild(messageText);

    // Create and append the timestamp paragraph
    const messageTime = document.createElement('p');
    messageTime.className = 'timechat';
    // Set the current time as the message timestamp
    const currentTime = new Date();
    messageTime.textContent = currentTime.getHours() + ':' + currentTime.getMinutes().toString().padStart(2, '0');
    messageDiv.appendChild(messageTime);

    chatdiv.appendChild(messageDiv);

    textarea.value = '';
}
