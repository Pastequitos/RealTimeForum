const cube = document.querySelector('.cube');

document.querySelector('.back').addEventListener('click', () => {
    cube.style.animation = "return 1s cubic-bezier(0.68,-0.2,0.265,1) forwards";
    
})

document.getElementById('register').addEventListener('click', function(event) {
    event.preventDefault();
    cube.style.animation = "turn 1s cubic-bezier(0.68,-0.2,0.265,1) forwards";

});


document.getElementById('registerdata').addEventListener('click', function(event) {
    event.preventDefault();
    const pagetitle = document.querySelector('.pagetitle');

    cube.style.animation = "byecube 2s cubic-bezier(0.68,-0.2,0.265,1) forwards";
    pagetitle.style.translate = "0px -100px";


    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var firstname = document.getElementById('firstname').value;
    var lastname = document.getElementById('lastname').value;
    var age = document.getElementById('age').value;
    var gender = document.getElementById('gender').value;


    var data = {
        "id" : 0,
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