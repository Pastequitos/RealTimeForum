document.addEventListener('DOMContentLoaded', function () {
    document.body.addEventListener('click', function (event) {
        // Toggle comment container visibility when a comment icon is clicked
        if (event.target.matches('.commenticon')) {
            const postContainer = event.target.closest('.post');
            const commentContainer = postContainer.querySelector('.post-comments');
            commentContainer.classList.toggle('closed');
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


/* sendcomment.addEventListener('click', function () {
    console.log('cliked')
}) */

function submitComment(postId) {
    const commentInput = document.getElementById(`commentinput-${postId}`);
    const commentContent = commentInput.value;
    console.log('Post ID:', postId);
    console.log('Comment content:', commentContent);
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
            console.log('Comment added:', data);
            displayComment(data, postId);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}