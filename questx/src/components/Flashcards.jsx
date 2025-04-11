import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { FileText, Image, Mic, Video } from 'lucide-react';
import Feedback from './Feedback';

const EnterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h12" />
    <path d="M15 8l4 4-4 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const Flashcards = ({ darkMode }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [responseTimes, setResponseTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [inputType, setInputType] = useState('text');
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (flashcards.length > 0 && !startTime) {
      setStartTime(Date.now());
    }
  }, [flashcards]);

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let formData = new FormData();
      formData.append('topic', inputContent);
      formData.append('input_type', inputType);
      if (file) {
        formData.append('file', file);
      }

      const response = await axios.post('http://localhost:5000/generate_questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFlashcards(response.data.questions);
      setCurrentCard(0);
      setIsFlipped(false);
      setSelectedOption('');
      setShowResult(false);
      setRecommendations([]);
      setQuizEnded(false);
      setScore(0);
      setAnsweredQuestions(0);
      setResponseTimes([]);
      setStartTime(null);
    } catch (error) {
      console.error('Error generating questions:', error);
    }
    setIsLoading(false);
    setInputContent('');
    setFile(null);
  };

  const handleNextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
      setSelectedOption('');
      setShowResult(false);
      setStartTime(Date.now());
    } else if (answeredQuestions < 5) {
      setCurrentCard(0);
      setStartTime(Date.now());
    }
  };

  const handlePrevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
      setSelectedOption('');
      setShowResult(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowResult(false);
  };

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
    setShowResult(false);
  };

  const handleSubmit = async () => {
    if (selectedOption) {
      console.log("\n\nSelected Option is :",selectedOption,"\n")
      console.log(flashcards[currentCard].correctOption )
      const endTime = Date.now();
      const responseTime = (endTime - startTime) / 1000; // Convert to seconds
      setResponseTimes([...responseTimes, responseTime]);

      setShowResult(true);
      const isCorrect = selectedOption === flashcards[currentCard].correctOption-1;
      if (isCorrect) {
        setScore(score+1);
      }
      setAnsweredQuestions(answeredQuestions + 1);

      if (answeredQuestions === 4) {
        try {
          const response = await axios.post('http://localhost:5000/generate_recommendations', { 
            topic: inputContent,
            score: score + (isCorrect ? 1 : 0)
          });
          setRecommendations(response.data.recommendations);
          setQuizEnded(true);
        } catch (error) {
          console.error('Error generating recommendations:', error);
        }
      } else {
        setTimeout(() => {
          handleNextCard();
        }, 2000); // Wait for 2 seconds before moving to the next card
      }
    }
  };

  const renderCardContent = (content) => {
    return <p className="text-xl">{content}</p>;
  };

  const renderAnswer = () => (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-6">
        {flashcards[currentCard].options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center space-x-3 text-lg ${
              darkMode ? 'text-white' : 'text-gray-800'
            } cursor-pointer hover:bg-opacity-10 hover:bg-blue-500 p-2 rounded-lg`}
          >
            <input
              type="radio"
              name="answer"
              value={index+1}
              checked={selectedOption === index}
              onChange={() => handleOptionSelect(index)}
              className="form-radio h-5 w-5 text-blue-500"
            />
            <span className="text-xl">{option}</span>
          </label>
        ))}
      </div>

      {showResult && (
        <div className="text-center">
          <div className={`text-xl font-bold mb-4 ${
            selectedOption == flashcards[currentCard].correctOption-1 ? 'text-green-500' : 'text-red-500'
          }`}>
            {selectedOption == flashcards[currentCard].correctOption-1 ? 'You are Right!' : 'You are Wrong!'}
          </div>
          {selectedOption !== flashcards[currentCard].correctOption && (
            <div className="text-lg font-semibold text-blue-500">
              Correct answer: {flashcards[currentCard].correctOption}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const handleInputTypeChange = (type) => {
    setInputType(type);
    setFile(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  if (quizEnded) {
    return <Feedback 
      darkMode={darkMode} 
      score={score} 
      totalQuestions={5} 
      recommendations={recommendations} 
      topic={inputContent}
      responseTimes={responseTimes}
    />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-12">
        <h1 className={`text-5xl font-bold mb-12 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Make Flashcards Your Way!
        </h1>
        <form onSubmit={handleContentSubmit} className="mb-12">
          <div className="flex items-center space-x-4 mb-4">
            <button
              type="button"
              onClick={() => handleInputTypeChange('text')}
              className={`p-2 rounded-full ${inputType === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <FileText />
            </button>
            <button
              type="button"
              onClick={() => handleInputTypeChange('image')}
              className={`p-2 rounded-full ${inputType === 'image' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <Image />
            </button>
            <button
              type="button"
              onClick={() => handleInputTypeChange('audio')}
              className={`p-2 rounded-full ${inputType === 'audio' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <Mic />
            </button>
            <button
              type="button"
              onClick={() => handleInputTypeChange('video')}
              className={`p-2 rounded-full ${inputType === 'video' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <Video />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {inputType === 'text' ? (
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="Enter the educational topic of your choice!"
                  className={`w-full px-6 py-3 pr-12 ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                  } border-2 ${
                    darkMode ? 'border-gray-700' : 'border-gray-300'
                  } rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                />
                <EnterIcon className={`h-6 w-6 absolute right-4 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
            ) : (
              <div className="flex-grow">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={inputType === 'image' ? 'image/*' : inputType === 'audio' ? 'audio/*' : 'video/*'}
                  className={`w-full px-6 py-3 ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                  } border-2 ${
                    darkMode ? 'border-gray-700' : 'border-gray-300'
                  } rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                />
              </div>
            )}
            <button
              type="submit"
              className={`px-6 py-3 ${
                darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-full transition-all duration-300 flex items-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Generate'}
            </button>
          </div>
        </form>
        {flashcards.length > 0 ? (
          <div className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl`}>
            <div className="mb-8 relative perspective">
              <div
                className={`w-full h-96 transition-transform duration-500 transform ${
                  isFlipped ? 'rotate-y-180' : ''
                } preserve-3d`}
              >
                <div className="absolute w-full h-full backface-hidden">
                  <div className={`${
                    darkMode ? 'bg-gray-700' : 'bg-blue-50'
                  } p-8 rounded-xl h-full flex flex-col justify-between shadow-lg`}>
                    <h2 className={`text-3xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Question {currentCard + 1}</h2>
                    <div className="flex-grow flex items-center justify-center">
                      {renderCardContent(flashcards[currentCard].question)}
                    </div>
                  </div>
                </div>
                <div className="absolute w-full h-full backface-hidden rotate-y-180">
                  <div className={`${
                    darkMode ? 'bg-gray-700' : 'bg-green-50'
                  } p-8 rounded-xl h-full flex flex-col shadow-lg`}>
                    <h2 className={`text-3xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Answer</h2>
                    <div className="flex-grow flex flex-col justify-between">
                      {renderAnswer()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePrevCard}
                className={`px-6 py-3 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } rounded-full transition-all duration-300 flex items-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                disabled={currentCard === 0}
              >
                <ArrowLeftIcon className={`h-5 w-5 mr-2 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>Previous</span>
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={handleFlip}
                  className={`px-6 py-3 ${
                    darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-500 hover:bg-green-600'
                  } text-white rounded-full transition-all duration-300 flex items-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  {isFlipped ? 'Show Question' : 'Show Options'}
                </button>
                {isFlipped && (
                  <button
                    onClick={handleSubmit}
                    className={`px-6 py-3 ${
                      darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white rounded-full transition-all duration-300 flex items-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    Submit
                  </button>
                )}
              </div>
              <button
                onClick={handleNextCard}
                className={`px-6 py-3 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } rounded-full transition-all duration-300 flex items-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                disabled={currentCard === flashcards.length - 1 && answeredQuestions === 5}
              >
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>Next</span>
                <ArrowRightIcon className={`h-5 w-5 ml-2 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
              </button>
            </div>
          </div>
        ) : (
          <div className={`text-center p-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <p>No flashcards available. Please enter a topic to generate questions!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;  