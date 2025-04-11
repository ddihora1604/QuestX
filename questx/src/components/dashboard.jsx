import { Link } from 'react-router-dom'

const Dashboard = ({ darkMode }) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-8 text-center`}>
          Where Flashcards Get Smarter, Quizzes Get Tougher,<br />
          and Learning Becomes a Game!
        </h1>
        <div className="flex flex-col space-y-6">
          <Link 
            to="/flashcards" 
            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} 
              p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full`}
          >
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Flashcards</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Create and study flashcards like a pro - to boost your brainpower with quizzes that play tough but help you win big in the game of learning!
            </p>
          </Link>
          <Link 
            to="/resources" 
            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} 
              p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full`}
          >
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Resources</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Get learning resources handpicked for you - because even geniuses need a little guidance!
            </p>
          </Link>
          <Link 
            to="/feedback" 
            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} 
              p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full`}
          >
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Feedback</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Check your scores and receive some personalized tips - because even your grades deserve a little upgrade to help you shine!
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard