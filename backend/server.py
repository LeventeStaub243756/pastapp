from flask import Flask, request, jsonify
import base64
import io
from PIL import Image
import numpy as np
import tensorflow as tf
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load the trained Keras model
model = tf.keras.models.load_model("pasta_model.h5")

# Define image preprocessing function
def preprocess_image(image):
    image = image.resize((256, 256))  # Resize image to model input size
    image = np.array(image) / 255.0   # Normalize to [0,1] range
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

# Define class names
class_names = ["fusilli", "penne", "spaghetti"]

@app.route('/classify', methods=['POST'])
def classify_pasta():
    try:
        # Get the base64 image from the request
        data = request.json['image']
        image_data = base64.b64decode(data.split(",")[1])
        image = Image.open(io.BytesIO(image_data)).convert('RGB')

        # Preprocess image
        processed_image = preprocess_image(image)

        # Predict with the model
        predictions = model.predict(processed_image)
        predicted_class = np.argmax(predictions)

        # Get pasta type
        pasta_type = class_names[predicted_class]

        return jsonify({"pasta": pasta_type})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Failed to process image"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Get PORT from environment
    app.run(host='0.0.0.0', port=port, debug=True)