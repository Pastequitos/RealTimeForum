let unreadedCounts = {};

function updateUserStatus() {
    setTimeout(() => {
        GetUnreadMessageDatabase()
            .then(data => {
                if (!data || !data.unreadednumbeofmessage || !data.unreadeduser) {
                    data = { unreadednumbeofmessage: [], unreadeduser: [] };
                }
                console.log(data)
                fetch('/getusers')
                    .then(response => response.json())
                    .then(users => {
                        const userContainer = document.getElementById('userContainer');
                        userContainer.innerHTML = '';

                // Separate users with an existing chat from those without
                const usersWithChat = [];
                const usersWithoutChat = [];

                users.forEach(user => {
                    if ((user.date != "")) {
                        usersWithChat.push(user);
                    } else {
                        usersWithoutChat.push(user);
                    }
                });

                        // Sort users alphabetically
                        usersWithChat.sort((a, b) => b.date.localeCompare(a.date));
                        usersWithoutChat.sort((a, b) => a.username.localeCompare(b.username));

                        console.log(usersWithChat)
                        console.log(usersWithoutChat)

                        // Concatenate users with chat and users without chat
                        const sortedUsers = usersWithChat.concat(usersWithoutChat);

                        // Add online/offline class and create elements for each user
                        sortedUsers.forEach(user => {
                            const userElement = document.createElement('div');
                            userElement.className = 'userStatus';
                            userElement.classList.add(user.connected === 1 ? 'online' : 'offline'); // Add online/offline class

                            userElement.id = "user" + user.id;
                            userElement.addEventListener('click', (event) => {
                                if (!event.target.classList.contains('user')) {
                                    // Click occurred on an element with class "user"
                                    addChat(user);
                                    removeUnread(user);
                                } else {
                                    // Click occurred on a child element of ".user"
                                    // Handle other actions here
                                }
                            });
                            const userImg = document.createElement('img');
                            userImg.addEventListener('click', () => showProfile(user.id));
                            if (user.pp) {
                                userImg.className = 'user';
                                userImg.src = `/getpp?id=${user.id}`;
                                userImg.style.marginTop = "-1px";
                            } else {
                                userImg.setAttribute('src', '../static/media/userinvert.png');
                                userImg.style.border = "none";
                                userImg.className = 'icon user';
                            }
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

                            if (!data || !data.unreadednumbeofmessage || !data.unreadeduser) {
                                return;
                            }

                            if (!document.getElementById("chatblock-" + user.id)) {
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
                            }

                            userContainer.appendChild(userElement);
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching users:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching unread message database:', error);
            });
    }, 10);
}




function unreaded(receiver_id) {
    /*     console.log('unreaded', receiver_id); */

    unreadedCounts[receiver_id] = (unreadedCounts[receiver_id] || 0) + 1;

    updateDatabase(receiver_id, unreadedCounts[receiver_id]);

    /*     console.log(`User ${receiver_id} has ${unreadedCounts[receiver_id]} unread messages.`); */
}



function removeUnread(user) {
    /*     console.log(user) */
    const divuser = document.getElementById("user" + user.id);
    if (!divuser.querySelector('.unreaded')) {
        return;
    }
    divuser.querySelector('.unreaded').style.right = "-50px";
    setTimeout(() => {
        divuser.querySelector('.unreaded').remove();
    }, 1000);

    unreadedCounts[user.id] = 0;
    const unreadCountSpan = document.querySelector(`#user${user.id} .unread-count`);
    if (unreadCountSpan) {
        unreadCountSpan.remove();
    }
    console.log('removed', user.id, unreadedCounts[user.id]);
    updateDatabase(user.id, unreadedCounts[user.id]);
}

function updateDatabase(receiver_id, unreadCount) {
    /*     console.log('updateDatabase', receiver_id, unreadCount); */
    let rid = receiver_id;
    const data = {
        receiver_id: rid,
        unread_count: unreadCount
    };
/*     console.log(data) */

    fetch('/updateUnreadMessages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Set the content type to JSON
        },
        body: JSON.stringify(data) // Convert data to JSON string
    })
        .catch(error => {
            console.error('Error updating database:', error);
        });
}

async function GetUnreadMessageDatabase() {
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

async function showProfile(userId) {
    if (!document.querySelector('.userProfilePage')) {
        try {
            const userDataResponse = await fetch(`/getuserdata?id=${userId}`);
            if (!userDataResponse.ok) {
                throw new Error('Failed to fetch user data');
            }
            const userData = await userDataResponse.json();

            // Create the user profile section
            const usercontainer = document.getElementById('userContainer');

            const userProfilePage = document.createElement('section');
            userProfilePage.classList.add('userProfilePage');
            userProfilePage.setAttribute('id', `userprofile${userId}`);



            const closeBtn = document.createElement('span');
            closeBtn.classList.add('userbtn', 'user-close-btn');
            closeBtn.addEventListener('click', () => {
                userProfilePage.classList.remove('activecard');
                document.querySelector('.menu').classList.remove('activecard');
                document.getElementById('userContainer').classList.remove('activecard');
                setTimeout(() => {
                    userProfilePage.remove();
                }, 1000);

            });
            userProfilePage.appendChild(closeBtn);

            const usernameElement = document.createElement('p');
            usernameElement.classList.add('usernameppage');
            usernameElement.textContent = userData.Username;
            userProfilePage.appendChild(usernameElement);

            const profilePictureUrl = await getMyProfilePictureUrl(userData.ID);

            // Set profile picture
            const userpppageImage = document.createElement('img');
            userpppageImage.classList.add('userpppage');
            if (profilePictureUrl) {
                userpppageImage.src = profilePictureUrl;
            } else {
                // Set a default profile picture if no URL is returned
                userpppageImage.src = 'default-profile-picture.jpg';
            }
            userProfilePage.appendChild(userpppageImage);
            // Set name
            const nameElement = document.createElement('p');
            nameElement.classList.add('nameppage');
            nameElement.textContent = `${userData.Firstname} ${userData.Lastname}`;
            userProfilePage.appendChild(nameElement);

            // Set age
            const ageElement = document.createElement('p');
            ageElement.classList.add('ageppage');
            ageElement.textContent = `${userData.Age} ans`;
            userProfilePage.appendChild(ageElement);

            // Set gender
            const genderElement = document.createElement('p');
            genderElement.classList.add('genderppage');
            genderElement.textContent = userData.Gender;
            userProfilePage.appendChild(genderElement);

            document.body.appendChild(userProfilePage);
            setTimeout(() => {
                usercontainer.classList.add('activecard');
                userProfilePage.classList.add('activecard');
                document.querySelector('.menu').classList.add('activecard');
            }, 100);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    } else if (document.querySelector('.userProfilePage') && !document.getElementById(`userprofile${userId}`)) {
        const usercontainer = document.getElementById('userContainer');
        const userProfilePage = document.querySelector('.userProfilePage');
    
        usercontainer.classList.remove('activecard');
        userProfilePage.classList.remove('activecard');
        document.querySelector('.menu').classList.remove('activecard');
    
        setTimeout(async () => {
            try {
                const userDataResponse = await fetch(`/getuserdata?id=${userId}`);
                if (!userDataResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const userData = await userDataResponse.json();
                userProfilePage.setAttribute('id', `userprofile${userId}`);
    
                userProfilePage.querySelector('.usernameppage').textContent = userData.Username;
                const profilePictureUrl = await getMyProfilePictureUrl(userData.ID);
                if (profilePictureUrl) {
                    userProfilePage.querySelector('.userpppage').src = profilePictureUrl;
                } else {
                    userProfilePage.querySelector('.userpppage').src = 'default-profile-picture.jpg';
                }
                userProfilePage.querySelector('.nameppage').textContent = `${userData.Firstname} ${userData.Lastname}`;
                userProfilePage.querySelector('.ageppage').textContent = `${userData.Age} ans`;
                userProfilePage.querySelector('.genderppage').textContent = userData.Gender;
    
                usercontainer.classList.add('activecard');
                userProfilePage.classList.add('activecard');
                document.querySelector('.menu').classList.add('activecard');
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }, 700);
    }

}
