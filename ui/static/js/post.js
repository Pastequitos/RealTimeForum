document.getElementById('submitpost').addEventListener('click', function () {
    const title = document.getElementById('title').value;
    const content = document.getElementById('inputpost').value;
    const category = document.getElementById('posttype').value;
    const nbcomment = 0

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
            date: "",
            nbcomment: nbcomment
        }),
    })
        .then(response => response.json())
        .then(data => {
            displayPost();
            sendMsg(conn, 0, { value: "New Post" }, 'post')
        })
        .catch((error) => {
            console.error('Error:', error);
        });

});


function displayPost() {

    const rightContainer = document.querySelector('.rightside');
    const leftContainer = document.querySelector('.leftside');

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
    postElement.setAttribute('data-post-id', post.ID);
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
    postlikeElement.addEventListener('click', () => toggleLike(post.ID, postlikeElement));

    checkIfLiked(post.ID, (isLiked) => {
        if (isLiked) {

            postlikeElement.classList.add('liked');
            postlikeElement.setAttribute('data-liked', 'true');
        } else {
            postlikeElement.setAttribute('data-liked', 'false');

        }
    });
    postinteractionElement.appendChild(postlikeElement);

    const postcommentElement = document.createElement('span');
    postcommentElement.classList.add('commenticon');
    postcommentElement.classList.add('invert');


    const postnbcomment = document.createElement('p');
    postnbcomment.classList.add('nbcomment');
    postnbcomment.textContent = post.NbComment;
    postcommentElement.appendChild(postnbcomment);
    postinteractionElement.appendChild(postcommentElement);

    const commentscontainer = document.createElement('div')
    commentscontainer.classList.add('commentscontainer')
    commentscontainer.classList.add('closed')
    postElement.appendChild(commentscontainer)

    const postComments = document.createElement('div');
    postComments.classList.add('post-comments');
    postComments.classList.add('closed');
    postElement.appendChild(postComments);

    const commentInput = document.createElement('textarea');
    commentInput.classList.add('commentinput');
    commentInput.setAttribute('id', `commentinput-${post.ID}`);
    commentInput.setAttribute('placeholder', 'Write a comment...');
    commentInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            submitComment(post.ID)
        }
    });
    postComments.appendChild(commentInput);

    const submitCommentButton = document.createElement('button');
    submitCommentButton.classList.add('sendComment');
    submitCommentButton.addEventListener('click', () => submitComment(post.ID));
    postComments.appendChild(submitCommentButton);

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

function checkIfLiked(postId, callback) {
    /*     console.log('checkIfLiked', postId) */
    fetch(`http://localhost:3003/like?postId=${postId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            /*             console.log('checked', data); */
            callback(data.liked); // `data.hasLiked` devrait être un booléen
        })
        .catch(error => {
            console.error('Error:', error);
            callback(false); // Assumer non "liké" en cas d'erreur
        });
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

const createpostscreen = document.querySelector('.createpost');
const postslider = document.querySelector('.slidetocreatepost');
let isDragging = false;
let startX, startRight;
let hasMoved = false; // To track if significant movement has occurred

const updateLimits = () => {
    const computedStyle = window.getComputedStyle(createpostscreen);
    startRight = parseInt(computedStyle.right, 10);
};

window.addEventListener('load', updateLimits);
window.addEventListener('resize', updateLimits);

const onMouseDown = (e) => {
    isDragging = false; // Reset isDragging
    hasMoved = false; // Reset hasMoved
    startX = e.clientX;
    updateLimits();

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp, { once: true });
};

const onMouseMove = (e) => {
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) { // Check if movement is significant (more than 5px)
        isDragging = true;
        hasMoved = true;
        let newRight = Math.max(0, startRight - dx);
        newRight = Math.min(newRight, window.innerWidth / 2 - 194);
        createpostscreen.style.right = `${newRight}px`;
        createpostscreen.style.transition = 'none';
    }
};

const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    if (createpostscreen.style.right === '0px' && !hasMoved) {
        console.log('has moved1')
        let newRight = Math.min(window.innerWidth / 2 - 194);
        createpostscreen.style.transition = '0.5s ease-in-out';
        createpostscreen.style.right = `${newRight}px`;
        setTimeout(() => {
            createpostscreen.style.transition = 'none';
        }, 500);
    }
    if (createpostscreen.style.right === '0px' && hasMoved) {
        console.log('has moved2')
        createpostscreen.style.transition = '0.5s ease-in-out';
        createpostscreen.style.right = '0px';
        setTimeout(() => {
            createpostscreen.style.transition = 'none';
        }, 500);
    }
    if (createpostscreen.style.right < '200px' && hasMoved) {
        createpostscreen.style.transition = '0.5s ease-in-out';
        createpostscreen.style.right = '0px';
        setTimeout(() => {
            createpostscreen.style.transition = 'none';
        }, 500);

    }
    if (createpostscreen.style.right >= '200px' && hasMoved) {
        createpostscreen.style.transition = '0.5s ease-in-out';
        let newRight = Math.min(window.innerWidth / 2 - 194);
        createpostscreen.style.right = `${newRight}px`;
        setTimeout(() => {
            createpostscreen.style.transition = 'none';
        }, 500);
    }
    isDragging = false;
};

postslider.addEventListener('mousedown', onMouseDown);
createpostscreen.style.position = 'absolute';