function toggleLike(postId, likeElement) {
    
    const isLiked = likeElement.getAttribute('data-liked') === 'true';
    const newLikedState = !isLiked;
    console.log(likeElement.getAttribute('data-liked'))

    fetch(`http://localhost:3003/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            postId: postId,
            liked: newLikedState, // Assurez-vous que c'est bien traité côté serveur
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (newLikedState) {
            console.log('Like added:', data);
            likeElement.setAttribute('data-liked', 'true');
            likeElement.classList.add('liked');
        } else {
            console.log('Like removed:', data);
            likeElement.setAttribute('data-liked', 'false');
            likeElement.classList.remove('liked');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

