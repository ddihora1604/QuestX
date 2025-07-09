# QuestX - AI-Powered Adaptive Quiz and Learning Platform

Prototype: https://youtu.be/-KM2JpU6woo?si=PR7RsLflCDPHM40A

## 🚀 Project Overview

QuestX is an Intelligent Quiz Platform featuring a Dynamic Difficulty Adjustment System that tailors content based on real-time user performance and feedback. Our platform offers a comprehensive learning experience through:

- **Adaptive Learning**: AI-powered difficulty adjustment based on user performance
- **Multi-modal Flashcards**: Enhanced with spaced repetition for optimal learning
- **Rich Media Support**: Process and analyze various content types including text, images, and audio
- **Personalized Experience**: Content recommendations based on learning patterns and progress

## ✨ Key Features

### AI-Powered Learning
- **Dynamic Difficulty Adjustment**: Automatically adjusts quiz difficulty based on real-time performance
- **Smart Content Extraction**: Uses NLP models to extract and structure learning materials
- **Multi-modal Support**: Process text, images, and audio content for comprehensive learning

### Interactive Learning
- **Adaptive Quizzes**: Personalized quiz experience that evolves with user progress
- **Smart Flashcards**: Spaced repetition system for optimal memory retention
- **Educational Resources**: Centralized access to diverse learning materials and references

### User Experience
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Intuitive Navigation**: Easy-to-use interface with clear navigation paths
- **Progress Tracking**: Monitor your learning journey and quiz performance

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Heroicons, Lucide React
- **State Management**: React Context API
- **Routing**: React Router v6
- **Data Visualization**: Chart.js with react-chartjs-2
- **Animation**: Framer Motion

### Backend & AI
- **Backend Framework**: Flask (Python)
- **Authentication & Database**: Firebase
- **Machine Learning**: PyTorch, HuggingFace Transformers
- **Natural Language Processing**: SpaCy
- **Computer Vision**: pytesseract (OCR)
- **Audio Processing**: Librosa
- **Media Processing**: ffmpeg
- **AI Services**: Google Gemini API

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/questx.git
   cd questx
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

## 📁 Project Structure

```
questx/
├── public/              # Static files
├── src/
│   ├── assets/          # Static assets (images, fonts, etc.)
│   ├── components/      # Reusable React components
│   │   ├── Dashboard.jsx
│   │   ├── Feedback.jsx
│   │   ├── Flashcards.jsx
│   │   ├── LoginPage.jsx
│   │   ├── Resources.jsx
│   │   └── Sidebar.jsx
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── .gitignore
├── package.json
├── README.md
└── vite.config.js
```
