let loggedInUsername = null;
function login() {
    facestatus = "login"
    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;
    
    console.log(username, password);
    
    
    
    var data = {
        "username": username,
        "password": password
    };
    
    let onlinestatus = document.querySelector('.onlinestatus');
    let navfooter = document.querySelector('.navfooter');
    let capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);
    
    postData('http://localhost:3003/login', data)
        .then(response => response.json())
        .then(data => {
            const responseType = data.type;
            if (responseType === "success") {
/*                 showUsers();
                showPosts(); */
                loggedInUsername = username.toLowerCase();
                console.log("success :", data.msg);
                console.log("logged in");
                cube.style.animation = "loggedin 2s cubic-bezier(0.68,-0.2,0.265,1) forwards";
                txtnotif.innerHTML = data.msg + "<br>Welcome " + capitalizedUsername + " !";
                notif.style.animation = "shownotif 7s ease-in-out forwards";
                progressbar.style.animation = "progress 7s ease-in-out forwards";
                navfooter.style.width = "50px";
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
                    pagetitle.textContent = 'FORUM';
                    pagetitle.style.translate = "0px 0px";
                    fgpassword.classList.remove('hide');
                }, 1100);

    
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
    
    function postData(url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }
    console.log("login");
}
