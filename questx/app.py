import os
from flask import Flask, request, jsonify
from flask_cors import CORS
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
CORS(app)

# Configure the Google Generative AI API
genai.configure(api_key="AIzaSyBzB-FbuQimtmUEoaXUwYdGoxUwTXvMO3I")

model = genai.GenerativeModel('gemini-pro')

# Initialize EasyOCR reader
reader = easyocr.Reader(['en'])

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
    result = reader.readtext(image_path)
    return ' '.join([text[1] for text in result])

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

# @app.route('/generate_questions', methods=['POST'])
# def generate_questions():
#     global improvement_topics

#     input_type = request.form.get('input_type', 'text')
#     topic = request.form.get('topic', '')

#     if input_type != 'text':
#         file = request.files.get('file')
#         if file:
#             file_path = os.path.join(uploads_directory, file.filename)
#             file.save(file_path)

#             if input_type == 'image':
#                 topic = extract_text_from_image(file_path)
#             elif input_type == 'audio':
#                 topic = extract_text_from_audio(file_path)
#             elif input_type == 'video':
#                 topic = extract_text_from_video(file_path)

#             os.remove(file_path)

#     improvement_prompt = ""
#     if improvement_topics:
#         improvement_prompt = f"Based on the user's previous incorrect responses, consider the topics: {', '.join(improvement_topics)}. "

#     prompt = (f"{improvement_prompt}Generate 5 multiple-choice questions on the topic '{topic}' "
#               f"for difficulty level: '{difficulty_level} on a scale of 1-10'. Each question should "
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
#         valid_json = valid_json.replace("{{", "{").replace("}}", "}")

#         # Attempt to parse the response as JSON
#         questions = json.loads(valid_json)  # Use json.loads instead of eval

#         return jsonify({"questions": [
#             {
#                 "question": q[0],
#                 "options": q[1:5],
#                 "correctOption": q[5].split(':')[-1].strip()
#             } for q in questions.values()
#         ]})
#     except json.JSONDecodeError as json_error:
#         print(f"JSON decoding error: {json_error}")  # Log the error to the console
#         return jsonify({"error": "Failed to parse questions.", "details": str(json_error)}), 500
#     except Exception as e:
#         print(f"Error generating questions: {e}")  # Log the error to the console
#         return jsonify({"error": "Failed to generate questions.", "details": str(e)}), 500



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

            os.remove(file_path)

    improvement_prompt = ""
    if improvement_topics:
        improvement_prompt = f"Based on the user's previous incorrect responses, consider the topics: {', '.join(improvement_topics)}. "

    prompt = (f"{improvement_prompt}Generate 5 multiple-choice questions on the topic '{topic}' "
              f"for difficulty level: '{difficulty_level} on a scale of 1-10'. Each question should "
              "have 4 options labeled A), B), C), and D). Provide the correct solution in the format: "
              "{{ 'Question1': ['Q1 Text', 'Q1 option A', 'Q1 option B', 'Q1 option C', 'Q1 option D', 'The number for correct option : 1/2/3/4'], "
              "'Question2': ... }}")

    try:
        response = model.generate_content(prompt)

        # Print the raw response for debugging
        print(f"Raw response: {response.text}")

        # Clean the response to make it valid JSON
        valid_json = response.text.replace("'", '"')  # Replace single quotes with double quotes

        # To further ensure validity, we should also remove extra braces
        valid_json = valid_json.replace("{{", "{").replace("}}", "}")

        # Attempt to parse the response as JSON
        questions = json.loads(valid_json)  # Use json.loads instead of eval

        return jsonify({"questions": [
            {
                "question": q[0],
                "options": q[1:5],
                "correctOption": q[5].split(':')[-1].strip()
            } for q in questions.values()
        ]})
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
