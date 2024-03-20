document.getElementById('loginPassword').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        login();
    }
});

let loggedInUsername = null;
function login() {
    facestatus = "login";
    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;
    var data = {
        "username": username,
        "password": password
    };

    console.log(data);

    const postslider = document.querySelector('.slidetocreatepost');
    let onlinestatus = document.querySelector('.onlinestatus');
    let navfooter = document.querySelector('.navfooter');
    let capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);
    const nobody = document.querySelector('.nobody');

    fetch('http://localhost:3003/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                console.log(response);
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const responseType = data.type;
            if (responseType === "success") {
                loggedInUsername = username.toLowerCase();
                cube.style.animation = "loggedin 2s cubic-bezier(0.68,-0.2,0.265,1) forwards";
                txtnotif.innerHTML = data.msg + "<br>Welcome " + capitalizedUsername + " !";
                notif.style.animation = "shownotif 7s ease-in-out forwards";
                progressbar.style.animation = "progress 7s ease-in-out forwards";
                navfooter.style.width = "50px";
                postslider.style.translate = "-30px -50%";
                nobody.style.opacity = 0;

                setTimeout(() => {
                    onlinestatus.style.display = "flex";
                    navusername.textContent = capitalizedUsername;
                    navfooter.style.width = "230px";
                }, 1500);
                setTimeout(() => {
                    resetNotif()
                }, 7000);

                pagetitle.style.translate = "0px -100px";
                setTimeout(() => {
                    display.style.translate = "0px 0px";
                    display.style.opacity = "1";

                    pagetitle.textContent = 'FORUM';
                    pagetitle.style.translate = "0px 0px";
                    fgpassword.classList.remove('hide');
                }, 1100);
                startWS();
                displayPost();
            } else if (responseType === "error") {
                cube.style.animation = "errorlogin 0.5s ease-in-out forwards";
                notif.style.animation = "shownotif 7s ease-in-out forwards";
                txtnotif.textContent = data.msg;
                progressbar.style.animation = "progress 7s ease-in-out forwards";
                setTimeout(() => {
                    cube.style.animation = "";
                }, 500);
                setTimeout(() => {
                    resetNotif()
                }, 7000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}



function startWS() {
    if (window["WebSocket"]) {
        conn = new WebSocket("ws://" + document.location.host + "/ws");

        conn.onopen = function () {
            // Ouverture connexion websocket.
            console.log("WebSocket connection is open");
        };

        conn.onmessage = function (evt) {
            const data = JSON.parse(evt.data);
            console.log(data)
            const responseType = data.msg_type;
            if (responseType === "post") {
                displayPost();
            }
            if (responseType === "online") {
                updateUserStatus();
            }
            if (responseType === "mp") {
                receiver_id = data.sender_id
                chatblock_id = 'chatblock-' + data.sender_id
                getMp(receiver_id, chatblock_id);
                unreaded(receiver_id);
                updateUserStatus(receiver_id, chatblock_id);
            }
        }

        conn.onclose = function (evt) {
            console.log("WebSocket connection is closed");
        };

    } else {
        console.log("<b>Your browser does not support WebSockets.</b>");
    }
}
