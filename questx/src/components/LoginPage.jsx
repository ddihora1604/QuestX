import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Make sure firebase is configured properly
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import googleLogo from "../images/google-logo.png"; // adjust the path to where the image is stored

const LoginPage = ({ darkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [grecaptcha, setGrecaptcha] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecaptcha = () => {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => setGrecaptcha(window.grecaptcha);
      document.body.appendChild(script);
    };
    loadRecaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!grecaptcha) {
      setMessage("reCAPTCHA is loading...");
      return;
    }

    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
      setMessage("Please complete the reCAPTCHA.");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        localStorage.setItem("userEmail", userCredential.user.email);
        navigate("/dashboard");
      } else {
        if (password !== confirmPassword) {
          setMessage("Passwords do not match.");
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        localStorage.setItem("userEmail", userCredential.user.email);
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setMessage("Sign up successful! You can now log in.");
      }
    } catch (error) {
      const errorCode = error.code;
      switch (errorCode) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          setMessage("Invalid credentials. Please try again.");
          break;
        case "auth/email-already-in-use":
          setMessage("Email already in use. Please try a different one.");
          break;
        default:
          setMessage("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem("userEmail", result.user.email);
      navigate("/dashboard");
    } catch (error) {
      setMessage("An error occurred during Google sign-in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async () => {
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
      <div className={`px-8 py-6 mt-4 text-left ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg`}>
        <h3 className={`text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {isLogin ? "Welcome to QUESTX!" : "Sign Up"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className={`block ${darkMode ? 'text-[#ffffff]' : 'text-[#000]'} " htmlFor="email`}>
                Email
              </label>
              <input
                type="text"
                placeholder="Email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 ${darkMode ? 'bg-[#ffffff] text-black' : 'bg-gray-200 text-black'} py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000a8]`}
                required
              />
            </div>
            <div className="mt-4">
              <label className={`block ${darkMode ? 'text-[#ffffff]' : 'text-[#000]'}`}>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 ${darkMode ? 'bg-[#ffffff]' : 'bg-gray-200'} text-black py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000a8]`}
                required
              />
            </div>
            {!isLogin && (
              <div className="mt-4">
                <label className={`block ${darkMode ? 'text-[#ffffff]' : 'text-[#000]'}`}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 ${darkMode ? 'bg-[#ffffff]' : 'bg-gray-200'} text-black py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000a8]`}
                  required
                />
              </div>
            )}
            {isLogin && (
              // <button
              //   type="button"
              //   onClick={forgotPassword}
              //   className="text-sm text-[#ffffff] hover:underline mt-2"
              // >
              //   Forgot Password?
              // </button>
              <a
                href="#"
                className={`text-sm ${darkMode ? 'text-[#ffffff]' : 'text-[#000]'} hover:underline`}
                onClick={forgotPassword}
              >
                Forgot Password?
              </a>
            )}
            <div className="mt-4">
              <div
                className="g-recaptcha"
                data-sitekey="6LfI70sqAAAAAMK7wc5vQ64kBVXDuvRcX1ePJG7k"
              ></div>
            </div>
            <div className="flex items-baseline justify-between">
              <button
                className={`px-6 py-2 mt-4 ${darkMode ? 'bg-[#ffffff] text-black' : 'bg-gray-200  text-black'}  rounded-lg hover:bg-[#7a7676] transition-colors duration-300`}
                disabled={isLoading}
              >
                {isLogin ? "Login" : "Sign Up"}
              </button>
              <a
                href="#"
                className={`text-sm ${darkMode ? 'text-[#ffffff]' : 'text-[#000]'} hover:underline`}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Create an account?" : "Already have an account?"}
              </a>
            </div>
          </div>
        </form>
        <button
          className={`w-full mt-4 ${darkMode ? 'bg-white text-black' : 'bg-gray-200  text-black'} py-2 rounded-lg flex items-center justify-center hover:bg-gray-100 border border-gray-300`}
          onClick={signInWithGoogle}
          disabled={isLoading}
        >
          <img src={googleLogo} alt="Google Logo" className="w-6 h-6 mr-2" />
          Continue with Google
        </button>

        {message && <p className="mt-4 text-red-600">{message}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
