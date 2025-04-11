import React, { useState } from 'react';
import { BookOpenIcon, VideoCameraIcon, DocumentTextIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Resources = ({ darkMode }) => {
  const [selectedResource, setSelectedResource] = useState(null);

  // Array of resources with additional back content
  const resources = [
    { 
      title: 'Introduction to React', 
      type: 'book', 
      link: 'https://reactjs.org/docs/getting-started.html', 
      description: 'A comprehensive guide to get started with React.',
      backContent: 'Recommended: React Official Documentation and Tutorial.' 
    },
    { 
      title: 'JavaScript Fundamentals', 
      type: 'video', 
      link: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 
      description: 'Master the basics of JavaScript with this video series.',
      backContent: 'Recommended: Eloquent JavaScript Book.' 
    },
    { 
      title: 'CSS Flexbox Guide', 
      type: 'article', 
      link: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', 
      description: 'Learn how to create flexible layouts with CSS Flexbox.',
      backContent: 'Recommended: CSS Tricks Flexbox Guide.' 
    },
    { 
      title: 'Node.js for Beginners', 
      type: 'book', 
      link: 'https://nodejs.dev/learn', 
      description: 'Start your journey with Node.js and server-side JavaScript.',
      backContent: 'Recommended: Node.js Official Documentation.' 
    },
    { 
      title: 'Responsive Web Design', 
      type: 'video', 
      link: 'https://www.freecodecamp.org/learn/responsive-web-design/', 
      description: 'Create websites that look great on any device.',
      backContent: 'Recommended: FreeCodeCamp Responsive Web Design Course.' 
    },
    { 
      title: 'Git Version Control', 
      type: 'article', 
      link: 'https://git-scm.com/book/en/v2', 
      description: 'Master Git and improve your development workflow.',
      backContent: 'Recommended: Pro Git Book.' 
    },
  ];

  const getIcon = (type) => {
    const iconClass = `h-8 w-8 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`;
    switch (type) {
      case 'book':
        return <BookOpenIcon className={iconClass} />;
      case 'video':
        return <VideoCameraIcon className={iconClass} />;
      case 'article':
        return <DocumentTextIcon className={iconClass} />;
      default:
        return null;
    }
  };

  const getCardColor = () => {
    return darkMode 
      ? 'from-[rgba(31,41,55,0)] to-[#3c4f6b]' // Dark mode gradient
      : 'from-[#3c4f6b] to-[rgba(31,41,55,0)]'; // Light mode gradient
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-200'} py-12`}>
      <div className={`container mx-auto px-4 py-12 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <motion.h1 
          className="text-5xl font-bold mb-12 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Resource Recommendations Hub!
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <motion.div
              key={index}
              className="relative w-full h-64 rounded-xl shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br ${getCardColor()} p-6 flex flex-col justify-between`}>
                <div className="flex items-start justify-between">
                  {getIcon(resource.type)}
                  <StarIcon className={`h-6 w-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{resource.title}</h2>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} capitalize text-sm`}>{resource.type}</p>
                </div>
                <motion.button
                  className={`mt-4 px-4 py-2 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} flex items-center justify-center space-x-2 transition-colors duration-300 hover:bg-opacity-80`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedResource(index)} // Set selected resource
                  aria-label={`Learn more about ${resource.title}`} // Accessibility improvement
                >
                  <span>Learn More</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </motion.button>
              </div>
              {selectedResource === index && ( // Show back content when selected
                <div className={`absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br ${getCardColor()} p-6 flex flex-col justify-between`}>
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recommendations</h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm flex-grow`}>{resource.backContent}</p>
                  <a
                    href={resource.link}
                    target="_blank" // Open link in a new tab
                    rel="noopener noreferrer" // Security improvement
                    className={`mt-4 px-4 py-2 rounded-full ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-white text-gray-800 hover:bg-gray-100'} flex items-center justify-center space-x-2 transition-colors duration-300`}
                  >
                    <span>Go to Resource</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;
