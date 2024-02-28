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
    console.log("here");

    const rightContainer = document.querySelector('.rightside');
    const leftContainer = document.querySelector('.leftside');

    // Clear the contents of both containers before appending new posts
    rightContainer.innerHTML = '';
    leftContainer.innerHTML = '';

    fetch('http://localhost:3003/post', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);

        const sortedData = data.sort((a, b) => new Date(b.Date) - new Date(a.Date));

        postCount = 0; 

        sortedData.forEach(post => {
            appendPosts(post);
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

let postCount = 0;

function appendPosts(post) {

    const rightContainer = document.querySelector('.rightside'); // Assuming .rightside is a class
    const leftContainer = document.querySelector('.leftside'); // Assuming .leftside is a class

    const postElement = document.createElement('div');
    postElement.classList.add('post');

    const postheaderElement = document.createElement('div');
    postheaderElement.classList.add('post-header');
    postElement.appendChild(postheaderElement);

    const userppElement = document.createElement('div');
    userppElement.classList.add('userpp');
    userppElement.classList.add('invert');
    postheaderElement.appendChild(userppElement);

    const userElement = document.createElement('p');
    userElement.classList.add('postusername');
    userElement.textContent = capitalize(post.Username);
    postheaderElement.appendChild(userElement);

    const imgElement = document.createElement('div');
    imgElement.classList.add('post-image');
    setBackgroundImageFromUnsplash(post.Title, imgElement);
    postElement.appendChild(imgElement);

    const titleElement = document.createElement('p');
    titleElement.classList.add('post-title');
    titleElement.textContent = post.Title;
    imgElement.appendChild(titleElement);

    const postcaptionElement = document.createElement('div');
    postcaptionElement.classList.add('post-caption');
    postElement.appendChild(postcaptionElement);
    
    const contentElement = document.createElement('p');
    contentElement.classList.add('post-content');

    contentElement.textContent = post.Content;
    postcaptionElement.appendChild(contentElement);

    const postinteractionElement = document.createElement('div');
    postinteractionElement.classList.add('post-interactions');
    postElement.appendChild(postinteractionElement);

    const postlikeElement = document.createElement('span');
    postlikeElement.classList.add('notliked');
    postlikeElement.classList.add('invert');
    postinteractionElement.appendChild(postlikeElement);

    const postcommentElement = document.createElement('span');
    postcommentElement.classList.add('comment');
    postcommentElement.classList.add('invert');
    postinteractionElement.appendChild(postcommentElement);

    const dateElement = document.createElement('div');
    dateElement.classList.add('post-time');
    dateElement.textContent = formatDate(post.Date);
    postElement.appendChild(dateElement);
/* 
    const categoryElement = document.createElement('p');
    categoryElement.classList.add('postcategory');
    categoryElement.textContent = post.Category;
    postElement.appendChild(categoryElement);
    */
    if (postCount % 2 === 0) {
        leftContainer.appendChild(postElement);
    } else {
        rightContainer.appendChild(postElement);
    }

    postCount++;
}

function setBackgroundImageFromUnsplash(searchTerm, element) {
    const accessKey = 'CuQwGV2t54kmskHozR2lQvRMNWTwhyLAKgRgHqcLJ-M'; // Use your actual Unsplash Access Key
    const url = `https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(searchTerm)}&client_id=${accessKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const imageUrl = data.results[0].urls.regular; // Get the URL of the first image
                element.style.backgroundImage = `url('${imageUrl}')`; // Set it as the background of the passed element
            } else {
                console.log('No images found for ' + searchTerm);
            }
        })
        .catch(error => console.error('Error fetching image:', error));
}




function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();

    const diffSeconds = Math.round((now - date) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMinutes < 1) return "il y a moins d'une minute";
    else if (diffMinutes < 5) return "il y a moins de 5 minutes";
    else if (diffMinutes < 15) return "il y a moins de 15 minutes";
    else if (diffMinutes < 45) return "il y a moins de 45 minutes";
    else if (diffHours < 24) return `il y a ${diffHours} heures`;
    else if (diffHours < 2) return "il y a 1 heure";
    else if (diffDays < 2) return "il y a 1 jour";
    else return `il y a ${diffDays} jours`;
}