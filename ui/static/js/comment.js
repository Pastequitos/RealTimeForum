document.addEventListener('DOMContentLoaded', function () {
    document.body.addEventListener('click', function (event) {
        // Toggle comment container visibility when a comment icon is clicked
        if (event.target.matches('.commenticon')) {
            const postContainer = event.target.closest('.post');
            const commentContainer = postContainer.querySelector('.post-comments');
            const commentscontainer = postContainer.querySelector('.commentscontainer');
            const postId = postContainer.getAttribute('data-post-id'); // Retrieve postId
            commentContainer.classList.toggle('closed');
            commentscontainer.classList.toggle('closed');
            if (!commentContainer.classList.contains('closed')) {
                seeComments(postId);
            }


        }
    });

    document.body.addEventListener('input', function (event) {
        if (event.target.matches('.commentinput')) {
            const textarea = event.target;
            const commentContainer = textarea.closest('.post-comments');
            if (!commentContainer.classList.contains('closed')) {
                autoResize(textarea, commentContainer);
            }
        }
    });
});

function autoResize(textarea, commentContainer) {
    if (!commentContainer.classList.contains('closed')) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        commentContainer.style.height = textarea.scrollHeight + 'px';
    } else {
        commentContainer.style.height = '0px';
    }
}

function submitComment(postId) {
    const commentInput = document.getElementById(`commentinput-${postId}`);
    const commentContent = commentInput.value;
    fetch(`http://localhost:3003/comment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            postId: postId,
            content: commentContent,
        }),
    })
        .then(response => response.json())
        .then(data => {
            const commenticon = document.querySelector('.commenticon');
            const nbcomment = commenticon.querySelector('.nbcomment');
            let nbComment = parseInt(nbcomment.textContent);
            nbcomment.textContent =  nbComment + 1;
            seeComments(postId);
            commentInput.value = "";
        })
        .catch(error => {
            console.error('Error:', error);
        });
};


function seeComments(postId) {
    const postContainer = document.querySelector(`.post[data-post-id="${postId}"]`);
    const commentscontainer = postContainer.querySelector('.commentscontainer');
    commentscontainer.innerHTML = '';

    fetch(`http://localhost:3003/comment?postId=${postId}`)
        .then(response => response.json())
        .then(comments => {
            const commentsize = document.createElement('div');
            commentsize.classList.add('commentsize');
            if (comments && Array.isArray(comments)) {
                comments.forEach(comment => {
                    const commentinfo = document.createElement('div');
                    commentinfo.classList.add('commentinfo');
                    commentsize.appendChild(commentinfo)
                    
                    const commentusername = document.createElement('p');
                    commentusername.classList.add('commentusername');
                    commentusername.textContent = commentusername.textContent = comment.Username.charAt(0).toUpperCase() + comment.Username.slice(1);
                    commentinfo.appendChild(commentusername)
                    
                    const commentdate = document.createElement('p');
                    commentdate.classList.add('commentdate');
                    commentdate.textContent = formatDateComm(comment.Date);
                    commentinfo.appendChild(commentdate)
                    
                    const commenttext = document.createElement('p');
                    commenttext.classList.add('comment');
                    commenttext.textContent = comment.Content;
                    commentsize.appendChild(commenttext)

                    commentscontainer.appendChild(commentsize) 
                });
            }
            document.querySelector('.commentscontainer').style.height = commentsize.scrollHeight + 'px';
        })
        .catch(error => console.error('Error fetching comments:', error));
}

function formatDateComm(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();

    const diffSeconds = Math.round((now - date) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMinutes < 1) return "now";
    else if (diffMinutes < 5) return "5 minutes ago";
    else if (diffMinutes < 15) return "15 minutes ago";
    else if (diffMinutes < 45) return "45 minutes ago";
    else if (diffHours < 24) return `${diffHours} hours ago`;
    else if (diffHours < 2) return "1 hour ago";
    else if (diffDays < 2) return "1 day ago";
    else return `${diffDays} days ago`;
}