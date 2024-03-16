function updateUserStatus() {
    fetch('/getusers')
        .then(response => response.json())
        .then(users => {
            const userContainer = document.getElementById('userContainer');
            userContainer.innerHTML = '';

            // Sort users based on connected status and alphabetically if no one is connected
            users.sort((a, b) => {
                if (a.connected === b.connected) {
                    // If both users have the same connected status, sort alphabetically by username
                    return a.username.localeCompare(b.username);
                } else {
                    // Otherwise, sort by connected status (online first)
                    return b.connected - a.connected;
                }
            });

            // Helper function to fetch messages between two users
            async function fetchMessages(senderId, receiverId) {
                const response = await fetch('/getmp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId })
                });
                const messages = await response.json();
                return messages;
            }

            // Iterate over each pair of users to determine the most recent conversation
            users.forEach(async (user1, index1) => {
                const userElement = document.createElement('div');
                userElement.className = 'userStatus';
                userElement.id = user1.id;
                userElement.addEventListener('click', () => addChat(user1));

                // Create and append user elements as before
                const userImg = document.createElement('img');
                userImg.setAttribute('src', '../static/media/user.png');
                userImg.className = 'icon invert user';
                userElement.appendChild(userImg);

                const statusDiv = document.createElement('div');
                statusDiv.className = 'status';

                const usernameP = document.createElement('p');
                usernameP.className = 'username';
                usernameP.textContent = user1.username.charAt(0).toUpperCase() + user1.username.slice(1); // Capitalizing username
                statusDiv.appendChild(usernameP);

                const onlineStatusDiv = document.createElement('div');
                onlineStatusDiv.className = 'useronlinestatus';

                const onlineP = document.createElement('p');
                onlineP.textContent = user1.connected === 1 ? 'online' : 'offline'; // Adjusting online/offline status

                const onlineCircleSpan = document.createElement('span');
                onlineCircleSpan.className = "onlinecircle";
                onlineCircleSpan.style.backgroundColor = user1.connected === 1 ? "#3ad323" : "red"; // Adjust for online/offline
                onlineStatusDiv.appendChild(onlineP);
                onlineStatusDiv.appendChild(onlineCircleSpan);

                statusDiv.appendChild(onlineStatusDiv);
                userElement.appendChild(statusDiv);
                userContainer.appendChild(userElement);

                for (let index2 = index1 + 1; index2 < users.length; index2++) {
                    const user2 = users[index2];
                    const messages1To2 = await fetchMessages(user1.id, user2.id);
                    const messages2To1 = await fetchMessages(user2.id, user1.id);
                    const lastMessage1To2 = messages1To2[messages1To2.length - 1];
                    const lastMessage2To1 = messages2To1[messages2To1.length - 1];
                    const lastMessage = lastMessage1To2?.date > lastMessage2To1?.date ? lastMessage1To2 : lastMessage2To1;
                    if (lastMessage) {
                        // Update user interface with last conversation info
                        const conversationInfo = document.createElement('p');
                        conversationInfo.textContent = `Last conversation: ${lastMessage.content}`;
                        userElement.appendChild(conversationInfo);
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}
