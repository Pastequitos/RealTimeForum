
function updateUserStatus() {
    fetch('/getusers')
        .then(response => response.json())
        .then(users => {
            const userContainer = document.getElementById('userContainer');
            userContainer.innerHTML = '';
            
            users.sort((a, b) => b.connected - a.connected);
            
            users.forEach(user => {
                console.log(user.id)
                const userElement = document.createElement('div');
                userElement.className = 'userStatus';
                userElement.id = user.id;
                userElement.addEventListener('click', () => addChat(user));


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
                onlineCircleSpan.style.backgroundColor = "red"; // Adjust for online/offline

                if (user.connected === 1) {
                    onlineCircleSpan.style.backgroundColor = "#3ad323"
                }

                onlineStatusDiv.appendChild(onlineP);
                onlineStatusDiv.appendChild(onlineCircleSpan);

                statusDiv.appendChild(onlineStatusDiv);

                userElement.appendChild(statusDiv);

                userContainer.appendChild(userElement);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}
