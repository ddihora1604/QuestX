import os
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import google.generativeai as genai
import easyocr
import cv2
import speech_recognition as sr
from pydub import AudioSegment
import json  # Add this line

# Set up ffmpeg path
AudioSegment.ffmpeg = r"C:\Users\Dihora\Downloads\DataHack 3.0\QUESTX\ffmpeg-2024-10-17-git-e1d1ba4cbc-essentials_build\bin\ffmpeg.exe"

# Create the uploads directory if it does not exist
uploads_directory = 'uploads'
os.makedirs(uploads_directory, exist_ok=True)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type"],
        "max_age": 600
    }
})

# Configure the Google Generative AI API
genai.configure(api_key="AIzaSyBzB-FbuQimtmUEoaXUwYdGoxUwTXvMO3I")

model = genai.GenerativeModel('gemini-pro')

# Initialize EasyOCR reader with error handling
try:
    # Try to initialize with English model
    reader = easyocr.Reader(['en'])
except Exception as e:
    print(f"Error initializing EasyOCR: {e}")
    print("Attempting to clean up and retry...")
    
    # Clean up any temporary files
    import shutil
    temp_zip = os.path.expanduser('~/.EasyOCR/model/temp.zip')
    if os.path.exists(temp_zip):
        try:
            os.remove(temp_zip)
            print("Cleaned up temporary zip file")
        except Exception as e:
            print(f"Warning: Could not remove temp file: {e}")
    
    # Try again with download disabled first
    try:
        reader = easyocr.Reader(['en'], download_enabled=False)
    except Exception as e:
        print(f"Failed to initialize EasyOCR: {e}")
        print("Please check your internet connection and try again.")
        reader = None

# Initialize speech recognizer
recognizer = sr.Recognizer()

difficulty_level = 5
improvement_topics = []

def get_difficulty(score):
    global difficulty_level
    if score > 3:
        difficulty_level = min(difficulty_level + 1, 10)
    elif score < 3:
        difficulty_level = max(difficulty_level - 1, 0)
    return difficulty_level

def extract_text_from_image(image_path):
    if reader is None:
        print("EasyOCR is not initialized. Cannot extract text from image.")
        return "Error: OCR functionality not available. Please check the server logs."
    try:
        result = reader.readtext(image_path)
        return ' '.join([text[1] for text in result])
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return "Error: Could not extract text from image"

def extract_text_from_audio(audio_path):
    audio = AudioSegment.from_file(audio_path)
    audio.export("temp.wav", format="wav")

    with sr.AudioFile("temp.wav") as source:
        audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data)
            return text
        except sr.UnknownValueError:
            return "Could not understand audio"
        except sr.RequestError:
            return "Could not request results"

def extract_text_from_video(video_path, interval=5):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return "Error: Could not open video."

    frame_count = 0
    texts = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % (interval * 30) == 0:
            results = reader.readtext(frame)
            texts.extend([text[1] for text in results])

        frame_count += 1

    cap.release()
    return ' '.join(texts)


#               "have 4 options labeled A), B), C), and D). Provide the correct solution in the format: "
#               "{{ 'Question1': ['Q1 Text', 'Q1 option A', 'Q1 option B', 'Q1 option C', 'Q1 option D', 'The number for correct option : 1/2/3/4'], "
#               "'Question2': ... }}")

#     try:
#         response = model.generate_content(prompt)

#         # Print the raw response for debugging
#         print(f"Raw response: {response.text}")

#         # Clean the response to make it valid JSON
#         valid_json = response.text.replace("'", '"')  # Replace single quotes with double quotes

#         # To further ensure validity, we should also remove extra braces
@app.route('/generate_questions', methods=['POST'])
def generate_questions():
    global improvement_topics

    input_type = request.form.get('input_type', 'text')
    topic = request.form.get('topic', '')

    if input_type != 'text':
        file = request.files.get('file')
        if file:
            file_path = os.path.join(uploads_directory, file.filename)
            file.save(file_path)

            if input_type == 'image':
                topic = extract_text_from_image(file_path)
            elif input_type == 'audio':
                topic = extract_text_from_audio(file_path)
            elif input_type == 'video':
                topic = extract_text_from_video(file_path)

            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Warning: Could not remove file {file_path}: {e}")

    improvement_prompt = ""
    if improvement_topics:
        improvement_prompt = f"Based on the user's previous incorrect responses, consider the topics: {', '.join(improvement_topics)}. "

    prompt = (f"{improvement_prompt}Generate 5 multiple-choice questions on the topic '{topic}' "
              f"for difficulty level: '{difficulty_level} on a scale of 1-10'. Each question should "
              "have 4 options labeled A), B), C), and D). Provide the correct solution in the format: "
              "{{ 'Question1': ['Q1 Text', 'Q1 option A', 'Q1 option B', 'Q1 option C', 'Q1 option D', 'The number for correct option : 1/2/3/4'], "
              "'Question2': ... }}")

    try:
        print(f"Generating questions with prompt: {prompt[:200]}...")  # Log first 200 chars of prompt
        
        # Generate content with error handling
        try:
            response = model.generate_content(prompt)
            questions = response.text.strip()
            print(f"Raw response from model: {questions[:500]}...")  # Log first 500 chars of response
        except Exception as gen_error:
            print(f"Error generating content: {str(gen_error)}")
            return jsonify({"error": "Failed to generate content", "details": str(gen_error)}), 500
        
        try:
            # Clean the response to make it valid JSON
            valid_json = questions.replace("'", '"')
            valid_json = valid_json.replace("{{", "{").replace("}}", "}")
            
            # Parse the JSON
            questions_json = json.loads(valid_json)
            
            # Format the response
            formatted_questions = []
            for i, q in enumerate(questions_json.values(), 1):
                if not isinstance(q, list) or len(q) < 6:
                    print(f"Warning: Question {i} has invalid format: {q}")
                    continue
                    
                try:
                    formatted_questions.append({
                        "question": str(q[0]),
                        "options": [str(opt) for opt in q[1:5]],
                        "correctOption": str(q[5]).split(':')[-1].strip()
                    })
                except Exception as q_error:
                    print(f"Error formatting question {i}: {q_error}")
                    continue
            
            if not formatted_questions:
                raise ValueError("No valid questions were generated")
                
            return jsonify({"questions": formatted_questions})
            
        except json.JSONDecodeError as json_error:
            print(f"JSON parsing error. Original response: {questions}")
            raise
    except json.JSONDecodeError as json_error:
        print(f"JSON decoding error: {json_error}")  # Log the error to the console
        return jsonify({"error": "Failed to parse questions.", "details": str(json_error)}), 500
    except Exception as e:
        print(f"Error generating questions: {e}")  # Log the error to the console
        return jsonify({"error": "Failed to generate questions.", "details": str(e)}), 500


@app.route('/generate_recommendations', methods=['POST'])
def generate_recommendations():
    global difficulty_level, improvement_topics

    data = request.json
    topic = data.get('topic', '')
    score = data.get('score', 0)

    difficulty_level = get_difficulty(score)

    prompt = f"Based on the user's performance in the quiz about '{topic}' with a score of {score}/5, suggest 3 specific areas or concepts for improvement. Provide concise, actionable recommendations."

    response = model.generate_content(prompt)
    recommendations = response.text.split('\n')

    improvement_topics = [topic] + recommendations[:2]

    return jsonify({"recommendations": recommendations})

if __name__ == '__main__':
    app.run(debug=True)
