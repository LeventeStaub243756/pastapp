// Get elements
const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const circleButton = document.getElementById('circle');
const context = canvas.getContext('2d');

// Access the user's camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
        camera.srcObject = stream;
    })
    .catch(err => {
        console.error("Camera access error: ", err);
    });

// Capture image and send to backend when the circle button is clicked
circleButton.addEventListener('click', () => {
    // Set canvas size to match the video feed
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    // Draw the current frame from the video feed onto the canvas
    context.drawImage(camera, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to base64
    const capturedImage = canvas.toDataURL('image/jpeg');

    // Send the image to the Flask backend
    fetch('https://pasta-classifier-41395746896.europe-west1.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: capturedImage })
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
        console.error("Error sending image:", error);
    });
});