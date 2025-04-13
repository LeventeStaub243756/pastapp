// Get elements
const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const circleButton = document.getElementById('circle');
const context = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading-screen');
const pastaElementsContainer = document.getElementById('pasta-elements-container');

let stream; // Store camera stream for later control
let classificationInProgress = false;

// Access the user's camera securely
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(mediaStream => {
        stream = mediaStream;
        camera.srcObject = mediaStream;
    })
    .catch(err => {
        console.error("Camera access error: ", err);
        alert("Camera access failed. Please ensure your browser allows camera usage.");
    });

function stopCameraStream() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        camera.srcObject = null;
    }
}

function showPastaElementsAnimation() {
    const pastaImages = [
        'images/penne_an.png', 
        'images/fusilli_an.png', 
        'images/spaghetti_an.png'
    ];
    let index = 0;

    const interval = setInterval(() => {
        const pastaElement = document.createElement('img');
        pastaElement.src = pastaImages[index];
        pastaElement.classList.add('pasta-element');
        pastaElementsContainer.appendChild(pastaElement);

        setTimeout(() => {
            pastaElement.remove();
        }, 1000);

        index = (index + 1) % pastaImages.length;
    }, 1000);
}

function retryClassification(image, retries = 0) {
    const maxRetries = 2;
    const retryDelay = 2000;

    return fetch('https://pasta-classifier-41395746896.europe-west1.run.app/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.pasta) {
            window.location.href = `${data.pasta}.html`;
        } else {
            alert("Could not classify the pasta.");
        }
    })
    .catch(error => {
        if (retries < maxRetries) {
            console.warn("Retrying classification...", error);
            return new Promise(resolve => setTimeout(resolve, retryDelay))
                .then(() => retryClassification(image, retries + 1));
        } else {
            console.error("Classification failed permanently:", error);
            alert("We couldn't classify the pasta. Please try again.");
        }
    });
}

// Capture image and send to backend
circleButton.addEventListener('click', () => {
    if (classificationInProgress) return; // Prevent multiple clicks
    classificationInProgress = true;

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    context.drawImage(camera, 0, 0, canvas.width, canvas.height);

    const capturedImage = canvas.toDataURL('image/jpeg');

    loadingScreen.style.display = 'block';
    showPastaElementsAnimation();

    setTimeout(() => {
        retryClassification(capturedImage)
            .finally(() => {
                classificationInProgress = false;
                loadingScreen.style.display = 'none';
                stopCameraStream();
            });
    }, 3000);
});
