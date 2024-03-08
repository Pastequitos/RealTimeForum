let loggedInUsername = null;
function login() {
    facestatus = "login"
    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;
    var data = {
        "username": username,
        "password": password
    };

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

                updateUserStatus();
            } else {
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

    /*     console.log("login"); */
}


function startWS() {
    if (window["WebSocket"]) {
        conn = new WebSocket("ws://" + document.location.host + "/ws");

        conn.onopen = function () {
            // Ouverture connexion websocket.
            console.log("WebSocket connection is open");
        };

        conn.onmessage = function (evt) {
            // Reception message websocket.
            const data = JSON.parse(evt.data);

            console.log(data)
            console.log(data.msg_type)
            const responseType = data.msg_type;
            if (responseType === "post") {
                console.log("New Post")
                displayPost();
            }
            if (responseType === "online") {
                console.log("New connection")
                updateUserStatus();
            }
        };

        conn.onclose = function (evt) {
            // Fermeture connexion websocket.
            console.log("WebSocket connection is closed");
        };
    } else {
        console.log("<b>Your browser does not support WebSockets.</b>");
    }
}
