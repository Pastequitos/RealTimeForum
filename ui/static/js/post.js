document.getElementById('submitpost').addEventListener('click', function() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('inputpost').value;
    const category = document.getElementById('posttype').value;

    // Example usage: log the data to the console
    console.log('Title:', title);
    console.log('Content:', content);
    console.log('Post Type:', category);



    
    fetch('http://localhost:3003/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: 0,
            user_id: "",
            title: title,
            content: content,
            category: category,
            date: ""
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        // displayPost()
        // sendMsg() => objectif envoyer un msg avec serveWs via conn.onmessage avec "post" pour qu'il comprenne que c'est un post et notifie les autres d'une notif
    })
    .catch((error) => {
        console.error('Error:', error);
    });
   
});


function displayPost(){
    fetch('http://localhost:3003/posts', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    // fetch post en GET, donc golang a faire avec SELECT * FROM posts
}