function logout() {
    fetch('/logout', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        let onlinestatus = document.querySelector('.onlinestatus');
        let navfooter = document.querySelector('.navfooter');

            console.log("success :", data.msg);
            cube.style.animation = "loggedout 2s cubic-bezier(0.68,-0.2,0.265,1) forwards";
            notif.style.animation = "shownotif 7s ease-in-out forwards";
            txtnotif.textContent = data.msg;
            progressbar.style.animation = "progress 7s ease-in-out forwards";
            navfooter.style.width = "50px";
            display.style.translate = "0px 100vh";

            setTimeout(() => {
                onlinestatus.style.display = "none";
                navusername.textContent = "Invite";
                navfooter.style.width = "230px";
            }, 1500);
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
