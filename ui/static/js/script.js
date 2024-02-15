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
    pagetitle.style.translate = "0px -100px";

    loginface.classList.remove('hide');
    userdataface.classList.add('hide');
    setTimeout(() => {
        registerface.classList.add('hide');

    }, 500);
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






document.getElementById('registerdata').addEventListener('click', function (event) {
    facestatus = "register"
    event.preventDefault()
    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var firstname = document.getElementById('firstname').value;
    var lastname = document.getElementById('lastname').value;
    var age = document.getElementById('age').value;
    var gender = document.getElementById('gender').value;

    console.log(username, email, password, firstname, lastname, age, gender);

    if (!username || !email || !password || !firstname || !lastname || !age || !gender) {
        cube.style.animation = "errorsignup 0.5s ease-in-out forwards";
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
    } else {
        var data = {
            "id": 0,
            "username": username,
            "email": email,
            "password": password,
            "firstname": firstname,
            "lastname": lastname,
            "age": age,
            "gender": gender
        };
        
        
        
        
        
        
        
        postData('http://localhost:3003/register', data)
        .then(response => response.json())

        .then(data => {
            const responseType = data.type;
            if (responseType === "success") {
                cube.style.transform = "rotateY(0deg) rotateX(0deg) rotateZ(0deg)";
                console.log("success :", data.msg);
                    notif.style.animation = "shownotif 7s ease-in-out forwards";
                    txtnotif.textContent = "✅" + data.msg;
                    progressbar.style.animation = "progress 7s ease-in-out forwards";
                    loginface.classList.remove('hide');
                    registerface.classList.add('hide');
                    pagetitle.style.translate = "0px -100px";
                    
                    setTimeout(() => {
                        userdataface.classList.add('hide');
                        pagetitle.textContent = 'LOGIN';
                        pagetitle.style.translate = "0px 0px";
                    }, 1000);
                    setTimeout(() => {
                        resetNotif()
                    }, 7000);
                    return
                } else {
                    console.log("error :", data.msg);
                    cube.style.animation = "errorsignup 0.5s ease-in-out forwards";
                    notif.style.animation = "shownotif 7s ease-in-out forwards";
                    txtnotif.textContent = "❌ " + data.msg;
                    progressbar.style.animation = "progress 7s ease-in-out forwards";
                    setTimeout(() => {
                        resetNotif()
                    }, 7000);
                    return
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
            })
        }
    }
});









document.getElementById('loginbtn').addEventListener('click', function (event) {
    facestatus = "login"

    event.preventDefault();

    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;

    console.log(username, password);

    var data = {
        "username": username,
        "password": password
    };

    postData('http://localhost:3003/login', data)
        .then(response => {
            console.log(response)
            if (response.ok) {
                console.log("logged in");
                cube.style.animation = "loggedin 2s cubic-bezier(0.68,-0.2,0.265,1) forwards";
                txtnotif.innerHTML = "✅ Successfully logged-in !<br>Welcome " + username.charAt(0).toUpperCase() + username.slice(1) + " !";
                notif.style.animation = "shownotif 7s ease-in-out forwards";
                progressbar.style.animation = "progress 7s ease-in-out forwards";
                setTimeout(() => {
                    resetNotif()
                }, 7000);

            } else {
                cube.style.animation = "errorlogin 0.5s ease-in-out forwards";
                notif.style.animation = "shownotif 7s ease-in-out forwards";
                txtnotif.textContent = "❌ Oups! invalid username or password";
                progressbar.style.animation = "progress 7s ease-in-out forwards";
                setTimeout(() => {
                    cube.style.animation = "";
                }, 500);
                setTimeout(() => {
                    resetNotif()
                }, 7000);
            }
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
});








function resetNotif() {
    notif.style.animation = "";
    txtnotif.textContent = "";
    progressbar.style.animation = "";
}