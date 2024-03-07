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
const display = document.querySelector('.display');
/* const screen = document.querySelector('.entiredisplay'); */
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


document.querySelector('.settings').addEventListener('click', () => {
    document.querySelector('.settingdiv').classList.toggle('active');
    document.getElementById('userContainer').classList.toggle('active');

});





function capitalize(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}




function sendMsg(conn, rid, msg, msg_type) {

    console.log(conn, msg, msg_type)
    // Check si WS ouverte.
    if (!conn) {
        return false;
    }

    // Check message vide.
    if (!msg.value) {
        return false;
    }

    let msgData = {
        id: 0,
        sender_id: 0,
        receiver_id: rid,
        content: msg.value,
        date: '',
        msg_type: msg_type,
    }

    console.log(msgData)

    conn.send(JSON.stringify(msgData))
    msg.value = "";
    return false;
};





