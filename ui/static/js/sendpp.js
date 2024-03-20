// Function to crop the image to a square 200x200 at the middle
function cropImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Determine the crop dimensions
            let size = Math.min(img.width, img.height);
            let x = (img.width - size) / 2;
            let y = (img.height - size) / 2;

            // Set canvas dimensions
            canvas.width = 200;
            canvas.height = 200;

            // Crop the image
            ctx.drawImage(img, x, y, size, size, 0, 0, canvas.width, canvas.height);

            // Convert canvas to Blob
            canvas.toBlob(function(blob) {
                callback(blob);
            }, 'image/jpeg');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Event listener for file input change
document.getElementById('profilePicture').addEventListener('change', async function(event) {
    console.log("profile picture");
    const file = event.target.files[0];

    // Crop the image before sending
    cropImage(file, async function(blob) {
        const formData = new FormData();
        formData.append('profilePicture', blob);

        try {
            const response = await fetch('/uploadpp', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Profile picture uploaded successfully!');
            } else {
                alert('Failed to upload profile picture.');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }
    });
});


async function getProfilePicture() {
    try {
        const response = await fetch('/getpp', {
            method: 'GET',
            headers: {
            }
        });
        if (response.ok) {
            const pictureBlob = await response.blob();

            const pictureUrl = URL.createObjectURL(pictureBlob);

            const imgElement = document.createElement('img');
            imgElement.src = pictureUrl;
            document.body.appendChild(imgElement);
        } else {
            console.error('Failed to retrieve profile picture. Status:', response.status);
        }
    } catch (error) {
        console.error('Error retrieving profile picture:', error);
    }
}

document.querySelector('.headerpostcontainer').addEventListener('click', function () {

    getProfilePicture();
})

