// Get elements
const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const circleButton = document.getElementById('circle');
const context = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading-screen'); // Add a loading screen element
const pastaElementsContainer = document.getElementById('pasta-elements-container'); // Container for pasta elements animation

// Access the user's camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
        camera.srcObject = stream;
    })
    .catch(err => {
        console.error("Camera access error: ", err);
    });

function showPastaElementsAnimation() {
    const pastaImages = [
        'images/penne_an.png', 
        'images/fusilli_an.png', 
        'images/spaghetti_an.png'
    ]; // Array of pasta image filenames
    let index = 0;

    const interval = setInterval(() => {
        const pastaElement = document.createElement('img');
        pastaElement.src = pastaImages[index];
        pastaElement.classList.add('pasta-element');
        pastaElementsContainer.appendChild(pastaElement);

        // Clear the element after 1 second for smooth animation
        setTimeout(() => {
            pastaElement.remove();
        }, 1000); // Remove element after 1 second

        index = (index + 1) % pastaImages.length; // Loop through images
    }, 1000); // New element every 1 second

    // Keep looping until classification is complete
}

// Retry mechanism for image classification
function retryClassification(image, retries = 0) {
    const maxRetries = 2;
    const retryDelay = 2000; // Retry after 2 seconds

    return fetch('https://pasta-classifier-41395746896.europe-west1.run.app/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Received classification:", data);
        if (data.pasta) {
            // Redirect to the correct pasta page
            window.location.href = `${data.pasta}.html`;
        } else {
            alert("Could not classify the pasta.");
        }
    })
    .catch(error => {
        if (retries < maxRetries) {
            console.log("Retrying classification...");
            return new Promise(resolve => setTimeout(resolve, retryDelay))
                .then(() => retryClassification(image, retries + 1));
        } else {
            console.error("Error sending image:", error);
            alert("Classification failed. Please try again later.");
        }
    });
}

// Capture image and send to backend when the circle button is clicked
circleButton.addEventListener('click', () => {

    // Set canvas size to match the video feed
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    // Draw the current frame from the video feed onto the canvas
    context.drawImage(camera, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to base64
    const capturedImage = canvas.toDataURL('image/jpeg');
    // Show loading screen and pasta animation immediately
    loadingScreen.style.display = 'block';
    showPastaElementsAnimation();
    // Wait for a few seconds to allow animation to play
    setTimeout(() => {
        // Call the retry classification function after the delay
        retryClassification(capturedImage)
            .finally(() => {
                // Hide loading screen after classification attempt
                loadingScreen.style.display = 'none';
            });
    }, 3000); // Delay for 2 seconds to allow the animation to play
});
