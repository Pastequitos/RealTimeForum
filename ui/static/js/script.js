const cube = document.querySelector('.cube');
const pagetitle = document.querySelector('.pagetitle');
const registerface = document.querySelector('.connectiondata')
const userdataface = document.querySelector('.userdata')
const loginface = document.querySelector('.login')
const fgpassword = document.querySelector('.forgetpassword')
const notif = document.querySelector('.topnotif')
const txtnotif = document.querySelector('.notif')
const progressbar = document.querySelector('.progressbar')
const navregister = document.getElementById('RegisterMenu')
const navlogin = document.getElementById('LoginMenu')
const navusername = document.querySelector('.username')
let facestatus = "login"


navregister.addEventListener('click', () => {
    if (facestatus == "register") {
        return;
    }
    facestatus = "register"
    cube.style.transform = "rotateY(90deg) rotateX(-90deg) rotateZ(180deg)";
    pagetitle.style.translate = "0px -100px";
    fgpassword.classList.add('hide');

    setTimeout(() => {
        loginface.classList.add('hide');
        registerface.classList.remove('hide');
        pagetitle.textContent = 'REGISTER';
        pagetitle.style.translate = "0px 0px";
    }, 1000);
    setTimeout(() => {
        userdataface.classList.remove('hide');
    }, 2000);

})

navlogin.addEventListener('click', () => {
    if (facestatus == "login") {
        return;
    }
    facestatus = "login"
    cube.style.transform = "rotateY(0deg) rotateX(0deg) rotateZ(0deg)";
    
    loginface.classList.remove('hide');
    userdataface.classList.add('hide');
    setTimeout(() => {
        registerface.classList.add('hide');
        
    }, 500);
    pagetitle.style.translate = "0px -100px";
    setTimeout(() => {
        pagetitle.textContent = 'LOGIN';
        pagetitle.style.translate = "0px 0px";
        fgpassword.classList.remove('hide');
    }, 1100);
})

document.querySelector('.backtologin').addEventListener('click', () => {
    facestatus = "login"
    cube.style.transform = "rotateY(0deg) rotateX(0deg) rotateZ(0deg)";
});


document.querySelector('.fgpassword').addEventListener('click', () => {
    facestatus = "login"
    cube.style.transform = "rotateY(-180deg) rotateX(0deg) rotateZ(180deg)";
});

document.getElementById('continue').addEventListener('click', function () {
    facestatus = "continue"
    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username || !email || !password) {
        console.log("!!!")
        cube.style.animation = "errorregister 0.5s ease-in-out forwards";
        notif.style.animation = "shownotif 7s ease-in-out forwards";
        txtnotif.textContent = "❌ Looks like you missed a field.";
        progressbar.style.animation = "progress 7s ease-in-out forwards";
        setTimeout(() => {
            cube.style.animation = "";
        }, 500);
        setTimeout(() => {
            resetNotif()
        }, 7000);
        return;
    } else if (!emailRegex.test(email)) {
        console.log("???")
        cube.style.animation = "errorregister 0.5s ease-in-out forwards";
        notif.style.animation = "shownotif 7s ease-in-out forwards";
        txtnotif.textContent = "❌ Please enter a valid email address.";
        progressbar.style.animation = "progress 7s ease-in-out forwards";
        setTimeout(() => {
            cube.style.animation = "";
        }, 500);
        setTimeout(() => {
            resetNotif()
        }, 7000);
        return;
    } else {
        cube.style.transform = "rotateY(90deg) rotateX(90deg) rotateZ(0deg)";
    }
});

document.querySelector('.back').addEventListener('click', () => {
    facestatus = "register"
    cube.style.transform = "rotateY(90deg) rotateX(-90deg) rotateZ(180deg)";
});

function resetNotif() {
    notif.style.animation = "";
    txtnotif.textContent = "";
    progressbar.style.animation = "";
}


document.addEventListener('DOMContentLoaded', function () {
    // Function to fetch and update user data
    function updateUserStatus() {
        fetch('/getusers')
            .then(response => response.json())
            .then(users => {
                const userContainer = document.getElementById('userContainer');
                userContainer.innerHTML = '';

                users.forEach(user => {
                    // Create container for each user
                    const userElement = document.createElement('div');
                    userElement.className = 'userStatus';

                    // Create and append img element
                    const userImg = document.createElement('img');
                    userImg.setAttribute('src', '../static/media/user.png');
                    userImg.className = 'icon invert user';
                    userElement.appendChild(userImg);

                    // Create and append status div
                    const statusDiv = document.createElement('div');
                    statusDiv.className = 'status';

                    // Create and append username paragraph
                    const usernameP = document.createElement('p');
                    usernameP.className = 'username';
                    usernameP.textContent = user.username.charAt(0).toUpperCase() + user.username.slice(1); // Capitalizing username
                    statusDiv.appendChild(usernameP);

                    // Create and append online status div
                    const onlineStatusDiv = document.createElement('div');
                    onlineStatusDiv.className = 'useronlinestatus';

                    // Create and append online status paragraph
                    const onlineP = document.createElement('p');
                    onlineP.textContent = user.connected === 1 ? 'online' : 'offline'; // Adjusting online/offline status

                    // Create and append online circle span
                    const onlineCircleSpan = document.createElement('span');
                    onlineCircleSpan.className = "onlinecircle";
                    onlineCircleSpan.style.backgroundColor = "red"; // Adjust for online/offline

                    if (user.connected === 1) {
                        onlineCircleSpan.style.backgroundColor = "#3ad323"
                    }

                    onlineStatusDiv.appendChild(onlineP);
                    onlineStatusDiv.appendChild(onlineCircleSpan);

                    // Append onlineStatusDiv to statusDiv
                    statusDiv.appendChild(onlineStatusDiv);

                    // Append statusDiv to userElement
                    userElement.appendChild(statusDiv);

                    // Append userElement to userContainer
                    userContainer.appendChild(userElement);
                });
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }
    /* 
        // Call updateUserStatus immediately when the page loads
        updateUserStatus();
    
        // Update user status every second (1000 milliseconds)
        setInterval(updateUserStatus, 1000); */
});


document.querySelector('.settings').addEventListener('click', () => {
    document.querySelector('.settingdiv').classList.toggle('active');
    document.getElementById('userContainer').classList.toggle('active');

});