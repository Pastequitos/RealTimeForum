function register() {
    facestatus = "register"
    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var firstname = document.getElementById('firstname').value;
    var lastname = document.getElementById('lastname').value;
    var age = parseInt(document.getElementById('age').value);
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
            "gender": gender,
            "connected" : 0
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
}