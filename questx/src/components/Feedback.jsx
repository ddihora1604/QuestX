import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

const Feedback = ({ darkMode, score, totalQuestions, recommendations, topic, responseTimes }) => {
  const [showDetailedPerformance, setShowDetailedPerformance] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const percentage = (score / totalQuestions) * 100;

  useEffect(() => {
    // Load performance history from localStorage
    const history = JSON.parse(localStorage.getItem('performanceHistory') || '[]');
    const newEntry = { topic, score, totalQuestions, date: new Date().toISOString() };
    const updatedHistory = [...history, newEntry];
    setPerformanceHistory(updatedHistory);
    
    // Save updated history to localStorage
    localStorage.setItem('performanceHistory', JSON.stringify(updatedHistory));
  }, [topic, score, totalQuestions]);

  const getCardColor = () => darkMode ? 'bg-gray-800' : 'bg-white';

  const renderPerformanceGraph = () => {
    return (
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">Response Time per Question</h3>
        <div className="flex flex-col">
          {responseTimes.map((time, index) => (
            <div key={index} className="mb-1">
              <span className="font-semibold">{index + 1}) </span>
              <span>{time.toFixed(1)}s</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPerformanceHistory = () => (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold mb-4">Performance History</h3>
      <div className="overflow-x-auto">
        <table className={`min-w-full ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Topic</th>
              <th className="px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {performanceHistory.map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}>
                <td className="px-4 py-2">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{entry.topic}</td>
                <td className="px-4 py-2">{entry.score}/{entry.totalQuestions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <h1 className="text-4xl font-bold mb-8 text-center">Your Performance Feedback for {topic}</h1>
      <motion.div 
        className={`p-6 rounded-lg shadow-lg ${getCardColor()}`}
        initial={{ scale: 0.95 }} 
        animate={{ scale: 1 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Quiz Results</h2>
          <div className="flex items-center">
            <div className={`text-5xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{percentage.toFixed(0)}%</div>
            <div className="ml-4">
              <p>{score} correct out of {totalQuestions} questions</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className={`p-4 rounded-lg shadow-lg ${getCardColor()} hover:shadow-xl`}
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-xl font-semibold text-green-600 mb-2 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2" />
              Strengths
            </h3>
            <p>
              {score >= 3 ? `You performed well` : 'Keep practicing to improve your skills.'}
            </p>
          </motion.div>
          <motion.div 
            className={`p-4 rounded-lg shadow-lg ${getCardColor()} hover:shadow-xl`}
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-xl font-semibold text-red-600 mb-2 flex items-center">
              <XCircle className="h-6 w-6 mr-2" />
              Areas for Improvement
            </h3>
            <div>
              {recommendations.map((rec, index) => (
                <div key={index} className="mb-1">{rec}</div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowDetailedPerformance(!showDetailedPerformance)}
            className={`px-6 py-3 rounded-full ${darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-500 hover:bg-blue-400'} text-white transition-colors duration-300 flex items-center justify-center`}
          >
            <BarChart className="mr-2" />
            {showDetailedPerformance ? 'Hide Detailed Performance' : 'View Detailed Performance'}
          </button>
        </div>
        {showDetailedPerformance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderPerformanceGraph()}
            {renderPerformanceHistory()}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Feedback;
