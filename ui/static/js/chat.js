/* document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.sidebar .user').forEach(user => {
        user.addEventListener('click', (event) => {
            if (!event.target.classList.contains('user')) {
                console.log('Click occurred on a child element of ".user"');
                // Click occurred on an element with class "user"
                addChatBlock(user.textContent);
            } else {
                // Click occurred on a child element of ".user"
                // Handle other actions here
            }
        });
    });
});
 */
function addChat(userName) {
    const chatArea = document.getElementById("chatsContainer");
    const chatBlockId = 'chatblock-' + userName.id;
    if (document.getElementById(chatBlockId)) {
        return;
    }
    const existingChatBlocks = chatArea.getElementsByClassName('chatblock').length;
    if (existingChatBlocks >= 2) {
        return;
    } else {
        const chatBlock = document.createElement('div');
        chatBlock.classList.add('chatblock');
        chatBlock.id = chatBlockId;



        const chatHeader = document.createElement('div');
        chatHeader.classList.add('chatHeader')

        const chatIcon = document.createElement('img');

        setTimeout(async () => {
            try {
                const profilePictureUrl = await getMyProfilePictureUrl(userName.id);
                if (profilePictureUrl) {
                    chatIcon.src = profilePictureUrl;
                } else {
                    console.error('Failed to get profile picture URL.');
                }
            } catch (error) {
                console.error('Error retrieving profile picture URL:', error);
            }
        }, 1);

        chatIcon.classList.add('chatIcon', 'user')
        chatHeader.appendChild(chatIcon)

        const chatOnlineCircle = document.createElement('span');
        chatOnlineCircle.className = 'chatOnlineCircle';
        chatHeader.appendChild(chatOnlineCircle);

        const chatUsername = document.createElement('p');
        chatUsername.className = 'chatUsername';
        chatUsername.textContent = userName.username.charAt(0).toUpperCase() + userName.username.slice(1);
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
            sendMp(textarea, userName.id, chatBlockId)
            getMp(userName.id, chatBlockId, messageOffset = 10)
            setScrollPosition(chatdiv);
        });
        textarea.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent default behavior (new line)
                sendMp(textarea, userName.id, chatBlockId);
                getMp(userName.id, chatBlockId, messageOffset = 10);
                setScrollPosition(chatdiv);
            }
        });
        inputDiv.appendChild(button);
        chatBlock.appendChild(inputDiv);
        chatArea.appendChild(chatBlock);
    }

    setTimeout(() => {
        getMp(userName.id, chatBlockId)
    }, 10);
}

function setScrollPosition(chatdiv) {
    chatdiv.scrollTop = chatdiv.scrollHeight;
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

function sendMp(textarea, receiver_id, chatBlockId) {
    const chatblock_id = chatBlockId
    const chatinput = textarea.value;
    textarea.value = '';
    sendMsg(conn, receiver_id, { value: chatinput }, 'mp', chatblock_id)
    updateUserStatus(chatBlockId, receiver_id);
/*     unreaded(receiver_id) */
}

let messageOffset = 10
let bt = false;

function getMp(receiver_id, chatBlockId) {
    const url = new URL('http://localhost:3003/getmp');
    url.searchParams.append('receiver_id', receiver_id);

    fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            if (document.getElementById(chatBlockId)) {
                const chatdiv = document.getElementById(chatBlockId).querySelector('.chatdiv');
                const scrollPosition = chatdiv.scrollHeight - chatdiv.scrollTop;
                chatdiv.innerHTML = "";
                if (messageOffset >= data.length || data.length === 0) {
                    let rest = data.length % 10;
                    let nextTenMessages = data.reverse().slice(0, data.length).reverse();

                    nextTenMessages.forEach(msg => {
                        const messageDiv = createMessageDiv(msg, receiver_id);
                        chatdiv.appendChild(messageDiv);
                    });
                    chatdiv.scrollTop = chatdiv.scrollHeight - scrollPosition;
                    if (rest >= 0) {
                        return
                    }
                }
                let nextTenMessages = data.reverse().slice(0, messageOffset).reverse();
                nextTenMessages.forEach(msg => {
                    const messageDiv = createMessageDiv(msg, receiver_id);
                    chatdiv.appendChild(messageDiv);
                });
                chatdiv.scrollTop = chatdiv.scrollHeight - scrollPosition;
                if (!bt) {
                    chatdiv.scrollTop = chatdiv.scrollHeight;
                    bt = true;
                }
                chatdiv.addEventListener('scroll', function () {
                    if (chatdiv.scrollTop === 0) {
                        messageOffset = messageOffset + 10;
                        getMp(receiver_id, chatBlockId)
                        chatdiv.removeEventListener('scroll', arguments.callee);
                    }
                });
            } else { //pas de chat ouvert
                return
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function createMessageDiv(msg, receiver_id) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'textchatdiv';
    // Decide the message alignment based on the sender
    messageDiv.classList.add(msg.sender_id === receiver_id ? 'leftchat' : 'rightchat');

    const messageContent = document.createElement('p');
    messageContent.className = 'textchat';
    messageContent.textContent = msg.content;
    messageDiv.appendChild(messageContent);

    const messageDate = document.createElement('p');
    messageDate.className = 'timechat';
    
    // Assuming msg.date is a string representation of a date (e.g., '2024-04-02T12:30:45')
    const date = new Date(msg.date);
    
    // Format the date as needed (e.g., toLocaleString())
    const formattedDate = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    
    messageDate.textContent = formattedDate;
    messageDiv.appendChild(messageDate);

    return messageDiv;
}

function unreadedMessages(receiver_id, chatBlockId) {
    if (document.getElementById(chatBlockId)) {
        console.log('This chat is already open.');
        return;
    } else {
 
        // Create a new audio element
        const audio = new Audio("../static/media/notif.wav");
        // Play the sound
        audio.play();

        const user = document.getElementById("user" + receiver_id);
        const unreaded = document.createElement('span');
        unreaded.className = 'unreaded';
        unreaded.style.right = "-50px";
        user.appendChild(unreaded);
        setTimeout(() => {
            unreaded.style.right = "-10px";
        }, 100);
    }
}



