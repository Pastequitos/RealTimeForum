function logout() {
    fetch('/logout', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {

        if (conn) {
            conn.close();
            console.log("closed websocket");
        }
        let onlinestatus = document.querySelector('.onlinestatus');
        let navfooter = document.querySelector('.navfooter');
        const usercontainer = document.getElementById('userContainer');

            console.log("success :", data.msg);
            cube.style.animation = "loggedout 2s cubic-bezier(0.68,-0.2,0.265,1) forwards";
            notif.style.animation = "shownotif 7s ease-in-out forwards";
            txtnotif.textContent = data.msg;
            progressbar.style.animation = "progress 7s ease-in-out forwards";
            navfooter.style.width = "50px";
            display.style.translate = "0px 100vh";
            usercontainer.style.translate = "-250px";

            footuser.style.transform = "scale(0.8) rotateY(180deg)";



            setTimeout(() => {
                onlinestatus.style.display = "none";
                navusername.textContent = "Invite";
                navfooter.style.width = "230px";
                usercontainer.innerHTML = "";

            }, 1500);

            setTimeout(() => {
                const usersettingsmenu = document.querySelector('.usersettingsmenu');
                usersettingsmenu.style.display = "none";
                removepp();
            }, 500);



            setTimeout(() => {
                resetNotif()
            }, 7000);

            pagetitle.style.translate = "0px -100px";
            setTimeout(() => {
                pagetitle.textContent = 'LOGIN';
                pagetitle.style.translate = "0px 0px";
                fgpassword.classList.remove('hide');
            }, 1100);
            
    })
    .catch(error => {
        // Handle any network or parsing errors
        console.error('Error:', error);
    });
}


window.addEventListener('beforeunload', function() {
    logout();
});


function removepp() {
    const imgElement = document.querySelector('.footericon.footeruser');
    imgElement.src = "../static/media/userinvert.png";
    imgElement.style.border = "0px";
    imgElement.style.marginTop = "0px";
    imgElement.removeEventListener('click', () => {
        showProfile(data.id);
    })
}