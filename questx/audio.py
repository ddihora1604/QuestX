import pydub
from pydub import AudioSegment
import speech_recognition as sr
import requests
import ast  # To safely evaluate the string representation of the dictionary
import os

def extract_text_from_audio(audio_path):
    audio = AudioSegment.from_file(audio_path)
    audio.export("audio.wav", format="wav")

    with sr.AudioFile("audio.wav") as source:
        audio_data = recognizer.record(source)
        try:
            # Use Google Web Speech API
            extracted_text = recognizer.recognize_google(audio_data)
            return extracted_text
        except sr.UnknownValueError:
            print("Google Speech Recognition could not understand audio.")
            return ""
        except sr.RequestError as e:
            print("Using pocketsphinx as a fallback.")
            try:
                extracted_text = recognizer.recognize_sphinx(audio_data)
                return extracted_text
            except sr.UnknownValueError:
                print("Pocketsphinx could not understand audio.")
                return ""
            except sr.RequestError as e:
                print(f"Could not request results from pocketsphinx; {e}")
                return ""


# Path to FFmpeg
def extract_text_from_audio(audio_path):
    audio = AudioSegment.from_file(audio_path)
    audio.export("audio.wav", format="wav")

    with sr.AudioFile("audio.wav") as source:
        audio_data = recognizer.record(source)
        try:
            # Use Google Web Speech API
            extracted_text = recognizer.recognize_google(audio_data)
            return extracted_text
        except sr.UnknownValueError:
            print("Google Speech Recognition could not understand audio.")
            return ""
        except sr.RequestError as e:
            print("Using pocketsphinx as a fallback.")
            try:
                extracted_text = recognizer.recognize_sphinx(audio_data)
                return extracted_text
            except sr.UnknownValueError:
                print("Pocketsphinx could not understand audio.")
                return ""
            except sr.RequestError as e:
                print(f"Could not request results from pocketsphinx; {e}")
                return ""

AudioSegment.converter = r"C:\Users\Subodh\Downloads\ffmpeg-2024-10-17-git-e1d1ba4cbc-essentials_build\bin\ffmpeg.exe"

# API key and endpoint for generating educational content
GENIE_API_KEY = "AIzaSyBzB-FbuQimtmUEoaXUwYdGoxUwTXvMO3I"# Load API key from environment variable
GENIE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

# Initialize SpeechRecognition recognizer
recognizer = sr.Recognizer()

# Function to get difficulty level based on score
def get_difficulty(score):
    global difficulty_level  # Access the global variable
    if score > 3:
        difficulty_level = min(difficulty_level + 1, 10)  # Increase difficulty, max 10
    elif score < 3:
        difficulty_level = max(difficulty_level - 1, 0)  # Decrease difficulty, min 0

difficulty_level = 5  # Initialize difficulty level
improvement_topics = []  # List to keep track of topics to improve

def extract_text_from_audio(audio_path):
    # Load the audio file
    audio = AudioSegment.from_file(audio_path)
    audio.export("Operating_System.wav", format="wav")  # Export to a consistent name

    # Use SpeechRecognition to transcribe audio
    with sr.AudioFile("audio.wav") as source:
        audio_data = recognizer.record(source)  # Read the entire audio file
        try:
            extracted_text = recognizer.recognize_sphinx(audio_data)
 # Use Google Web Speech API
            return extracted_text
        except sr.UnknownValueError:
            print("Google Speech Recognition could not understand audio.")
            return ""
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition service; {e}")
            return ""

def generate_questions(topic):
    global difficulty_level  # Use global difficulty level
    improvement_prompt = ""
    
    # Modify prompt to include topics for improvement if they exist
    if improvement_topics:
        improvement_prompt = f"Based on the user's previous incorrect responses, consider the topics: {', '.join(improvement_topics)}. "

    # Request payload for generating questions
    request_data = {
        "contents": [{
            "parts": [{
                "text": f"{improvement_prompt}Generate 5 multiple-choice questions on the topic '{topic}' for difficulty level: '{difficulty_level} on a scale of 1-10'. "
                        "Each question should have 4 options labeled A), B), C), and D). "
                        "Provide the correct solution in the format: "
                        "{ 'Question1': ['Q1 Text', 'Q1 option 1', 'Q1 option 2', 'Q1 option 3', 'Q1 option 4', 'The number for correct option : 1/2/3/4'], "
                        "'Question2': ... }"
            }]
        }]
    }

    # Make the API request
    response = requests.post(
        GENIE_API_URL,
        json=request_data,
        headers={
            'Content-Type': 'application/json',
            'x-goog-api-key': GENIE_API_KEY
        }
    )

    # Check for successful response
    if response.status_code == 200:
        response_json = response.json()
        generated_questions = response_json['candidates'][0]['content']['parts'][0]['text']
        return generated_questions
    else:
        return f"Error: {response.status_code} - {response.json().get('error', {}).get('message', 'An unknown error occurred')}"

def parse_questions(questions_str):
    questions_dict = ast.literal_eval(questions_str)
    questions = []
    options = []
    answers = []

    for key, value in questions_dict.items():
        questions.append(value[0])  # Add question text
        options.append(value[1:5])  # Add options (A, B, C, D)
        answers.append(value[5])  # Add correct answer index

    return questions, options, answers

def generate_recommendations(topics):
    recommendations = []
    for topic in topics:
        request_data = {
            "contents": [{
                "parts": [{
                    "text": f"Based on the user's incorrect response in technical '{topic}', suggest 1 or 2 topics for improvement."
                }]
            }]
        }

        response = requests.post(
            GENIE_API_URL,
            json=request_data,
            headers={
                'Content-Type': 'application/json',
                'x-goog-api-key': GENIE_API_KEY
            }
        )

        if response.status_code == 200:
            response_json = response.json()
            recommendation = response_json['candidates'][0]['content']['parts'][0]['text']
            recommendations.append((topic, recommendation))
        else:
            recommendations.append((topic, f"Error: {response.status_code} - {response.json().get('error', {}).get('message', 'An unknown error occurred')}"))

    return recommendations

# Main execution to take user input
if __name__ == "__main__":
    while True:  # Start a while loop
        audio_path = input("Enter path to audio file: ")  # Update with your audio file path
        topic = extract_text_from_audio(audio_path)  # Extract the topic from the audio

        if not topic:  # Exit if no text is extracted
            print("No text detected in the audio.")
            break

        questions_str = generate_questions(topic)

        if "Error:" not in questions_str:
            questions_list, options_list, answers_list = parse_questions(questions_str)

            print("\nGenerated Questions:")
            for i, question in enumerate(questions_list):
                print(f"{i + 1}. {question}")
                print("Options:")
                for j, option in enumerate(options_list[i]):
                    print(f"   {chr(65 + j)}) {option}")
                print()  # Blank line for better readability

            user_answers = []
            incorrect_topics = []
            for i in range(len(questions_list)):
                answer = input(f"Enter your answer for Question {i + 1} (A/B/C/D): ").strip().upper()
                user_answers.append(answer)

                correct_answer = None
                try:
                    correct_answer_index = int(answers_list[i].split(': ')[-1])
                    correct_answer = chr(65 + correct_answer_index - 1)
                except (ValueError, IndexError):
                    correct_answer = None

                if correct_answer and user_answers[i] != correct_answer:
                    incorrect_topics.append(topic)
                    if topic not in improvement_topics:
                        improvement_topics.append(topic)

            score = sum(1 for i in range(len(questions_list)) if user_answers[i] == correct_answer)

            print(f"\nYour score: {score}/{len(questions_list)}")

            correct_answers_display = [chr(65 + int(ans.split(': ')[-1]) - 1) for ans in answers_list]
            print("\nCorrect Answers and Your Answers:")
            for i in range(len(questions_list)):
                print(f"Question {i + 1}:")
                print(f"  Correct Answer: {correct_answers_display[i]}")
                print(f"  Your Answer: {user_answers[i]}\n")

            get_difficulty(score)

            if improvement_topics:
                recommendations = generate_recommendations(improvement_topics)
                print("\nRecommendations for Improvement:")
                for topic, recommendation in recommendations:
                    print(f"Topic: {topic}, Recommendation: {recommendation}")
            else:
                print("\nNo recommendations needed.")

            continue_prompt = input("\nWould you like to process another audio file? (yes/no): ").strip().lower()
            if continue_prompt != 'yes':
                print("Exiting the program.")
                break
        else:
            print(questions_str)
            break
