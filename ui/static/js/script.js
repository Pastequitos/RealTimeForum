const cube = document.querySelector('.cube');
const pagetitle = document.querySelector('.pagetitle');
const registerface = document.querySelector('.connectiondata')
const userdataface = document.querySelector('.userdata')
const loginface = document.querySelector('.login')
const fgpassword = document.querySelector('.forgetpassword')

document.querySelector('.backtologin').addEventListener('click', () => {
    cube.style.animation = "backforgetpassword 2s cubic-bezier(0.68,-0.2,0.265,1) forwards";
    fgpassword.classList.add('hide')
    loginface.classList.remove('hide');
})

document.querySelector('.back').addEventListener('click', () => {
    cube.style.animation = "return 1s cubic-bezier(0.68,-0.2,0.265,1) forwards";
})

document.querySelector('.fgpassword').addEventListener('click', () => {
    console.log('forget password')
    fgpassword.classList.remove('hide')
        cube.style.animation = "forgetpassword 2s cubic-bezier(0.68,-0.2,0.265,1) forwards";
    loginface.classList.add('hide');
});

document.getElementById('register').addEventListener('click', function (event) {
    event.preventDefault();
    cube.style.animation = "turn 1s cubic-bezier(0.68,-0.2,0.265,1) forwards";

});


document.getElementById('registerdata').addEventListener('click', function (event) {
    event.preventDefault();

    userdataface.classList.add('hide');
    registerface.classList.add('hide');
    loginface.classList.remove('hide');


    cube.style.animation = "login 2s cubic-bezier(0.68,-0.2,0.265,1) forwards";
    pagetitle.style.translate = "0px -100px";
    setTimeout(() => {
        pagetitle.textContent = 'LOGIN';
        pagetitle.style.translate = "0px 0px";
    }, 1000);


    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var firstname = document.getElementById('firstname').value;
    var lastname = document.getElementById('lastname').value;
    var age = document.getElementById('age').value;
    var gender = document.getElementById('gender').value;


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
        .then(data => {
            console.log("register");
        });

    function postData(url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json());
    }
    console.log("registerdata");
})