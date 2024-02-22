document.getElementById('submitpost').addEventListener('click', function () {
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
            displayPost();
            // displayPost()
            // sendMsg() => objectif envoyer un msg avec serveWs via conn.onmessage avec "post" pour qu'il comprenne que c'est un post et notifie les autres d'une notif
        })
        .catch((error) => {
            console.error('Error:', error);
        });

});


function displayPost() {
    console.log("here")
    fetch('http://localhost:3003/post', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })


        .then(response => response.json())


        .then(data => {
            console.log(data)
            for (let i = 0; i < data.length; i++) {
                appendPosts(data[i])
            }
            //ICI   
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    // fetch post en GET, donc golang a faire avec SELECT * FROM posts
}

function appendPosts(post) { // Ajoute 'post' comme paramètre de la fonction
    const container = document.getElementById('postsContainer');
    console.log(post.Title)
    console.log(post.Content)
    console.log(post.Date)

    // Crée un nouvel élément div pour chaque post
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    // Crée et ajoute le titre
    const titleElement = document.createElement('p');
    titleElement.textContent = `Titre: ${post.Title}`; // Utilise `post.title`
    postElement.appendChild(titleElement);

    // Crée et ajoute le contenu
    const contentElement = document.createElement('p');
    contentElement.textContent = `Contenu: ${post.Content}`; // Utilise `post.content`
    postElement.appendChild(contentElement);

    // Crée et ajoute la catégorie
    const categoryElement = document.createElement('p');
    categoryElement.textContent = `Catégorie: ${post.Category}`; // Utilise `post.category`
    postElement.appendChild(categoryElement);

    const dateElement = document.createElement('p');
    dateElement.textContent = `Date: ${post.Date}`; // Utilise `post.category`
    postElement.appendChild(dateElement);

    // Ajoute le postElement au conteneur
    container.appendChild(postElement);

    
}