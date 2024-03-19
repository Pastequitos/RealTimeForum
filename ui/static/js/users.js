let unreadedCounts = {}; // Initialize an empty object to store unread message counts

function updateUserStatus() {
    GetUnreadMessageDatabase()
        .then(data => {
            console.log("Data from GetUnreadMessageDatabase:", data);
            fetch('/getusers')
                .then(response => response.json())
                .then(users => {
                    const userContainer = document.getElementById('userContainer');
                    userContainer.innerHTML = '';

                    // Sort users based on connected status
                    users.sort((a, b) => b.connected - a.connected);

                    // Add online/offline class and create elements for each user
                    users.forEach(user => {
                        const userElement = document.createElement('div');
                        userElement.className = 'userStatus';
                        userElement.classList.add(user.connected === 1 ? 'online' : 'offline'); // Add online/offline class

                        userElement.id = "user" + user.id;
                        userElement.addEventListener('click', () => addChat(user));
                        userElement.addEventListener('click', () => removeUnread(user));

                        const userImg = document.createElement('img');
                        userImg.setAttribute('src', '../static/media/user.png');
                        userImg.className = 'icon invert user';
                        userElement.appendChild(userImg);

                        const statusDiv = document.createElement('div');
                        statusDiv.className = 'status';

                        const usernameP = document.createElement('p');
                        usernameP.className = 'username';
                        usernameP.textContent = user.username.charAt(0).toUpperCase() + user.username.slice(1); // Capitalizing username
                        statusDiv.appendChild(usernameP);

                        const onlineStatusDiv = document.createElement('div');
                        onlineStatusDiv.className = 'useronlinestatus';

                        const onlineP = document.createElement('p');
                        onlineP.textContent = user.connected === 1 ? 'online' : 'offline'; // Adjusting online/offline status

                        const onlineCircleSpan = document.createElement('span');
                        onlineCircleSpan.className = "onlinecircle";
                        onlineCircleSpan.style.backgroundColor = user.connected === 1 ? "#3ad323" : "red"; // Adjust for online/offline

                        onlineStatusDiv.appendChild(onlineP);
                        onlineStatusDiv.appendChild(onlineCircleSpan);

                        statusDiv.appendChild(onlineStatusDiv);

                        userElement.appendChild(statusDiv);

                        userContainer.appendChild(userElement);

                        // Check if the user has unread messages and update UI accordingly
                        const unreadIndex = data.unreadeduser.indexOf(user.id);
                        if (unreadIndex !== -1) {
                            const unreadCountSpan = document.createElement('span');
                            unreadCountSpan.textContent = data.unreadednumbeofmessage[unreadIndex];
                            unreadCountSpan.className = 'unread-count';

                            const unreaded = document.createElement('span');
                            unreaded.className = 'unreaded';
                            unreaded.style.right = "-40px"
                            unreaded.appendChild(unreadCountSpan);
                            userElement.appendChild(unreaded);
                            setTimeout(() => {
                                unreaded.style.right = "-10px"
                            }, 100);
                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching users:', error);
                });
        })
        .catch(error => {
            console.error('Error fetching unread message database:', error);
        });
}


/* 
function unreaded(receiver_id) {
    console.log('unreaded', receiver_id);

    unreadedCounts[receiver_id] = (unreadedCounts[receiver_id] || 0) + 1;

    updateDatabase(receiver_id, unreadedCounts[receiver_id]);

    console.log(`User ${receiver_id} has ${unreadedCounts[receiver_id]} unread messages.`);
} */



/* function removeUnread(user) {
        const user = document.getElementById("user" + receiver_id);
        user.querySelector('.unreaded').style.right = "-40px";
        setTimeout(() => {
            user.querySelector('.unreaded').remove();
        }, 1000);

    unreadedCounts[user.id] = 0;
    const unreadCountSpan = document.querySelector(`#user${user.id} .unread-count`);
    if (unreadCountSpan) {
        unreadCountSpan.remove();
    }
} */

function updateDatabase(receiver_id, unreadCount) {
    console.log('updateDatabase', receiver_id, unreadCount);
    let rid = receiver_id;
    const data = {
        receiver_id: rid,
        unread_count: unreadCount
    };
    console.log(data)

    fetch('/updateUnreadMessages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Set the content type to JSON
        },
        body: JSON.stringify(data) // Convert data to JSON string
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update database');
            }
            console.log('Database updated successfully');
            return response.json();
        })
        .then(data => {
            console.log('Data:', data);
        })
        .catch(error => {
            console.error('Error updating database:', error);
        });
}

function GetUnreadMessageDatabase() {
    return fetch('/getUnreadMessages', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Set the content type to JSON
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch unread messages');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error fetching unread messages:', error);
        throw error; // Propagate the error
    });
}