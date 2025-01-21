import React, { useState, useEffect } from 'react';

export function App() {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to extract video ID from URL
    const extractVideoId = () => {
      const url = window.location.href;
      const urlParams = new URL(url);
      const videoId = urlParams.searchParams.get('v'); // For standard YouTube URLs
      if (videoId) return videoId;

      // For short YouTube URLs (e.g., youtu.be/VIDEO_ID)
      const path = urlParams.pathname;
      return path.startsWith('/') ? path.substring(1) : null;
    };

    const videoId = extractVideoId();
    if (!videoId) {
      setError('Invalid YouTube URL: Could not extract video ID.');
      return;
    }

    // Fetch quiz data
    const fetchQuiz = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ video_id: videoId }),
        });
        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        setError('Failed to fetch quiz data.');
      }
    };

    fetchQuiz();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!quiz) {
    return <div>Loading...</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  // Pre-assign colors: green for the correct answer, red for others
  const getColor = (option) => {
    const isCorrect =
      option.option === currentQuestion.answer || // Matches full option text
      option.option.startsWith(currentQuestion.answer); // Matches the first character
    return isCorrect ? 'green' : 'red';
  };

  const handleAnswer = (option) => {
    setSelectedAnswer(option);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>
        Question {currentQuestionIndex + 1}/{quiz.questions.length}
      </h1>
      <p>{currentQuestion.text}</p>
      {currentQuestion.options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => handleAnswer(option.option)}
          style={{
            display: 'block',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '20px',
            backgroundColor:
              selectedAnswer === option.option ? getColor(option) : '#ccc',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {option.option}
        </button>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button
          onClick={() => {
            setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
            setSelectedAnswer(null);
          }}
          disabled={currentQuestionIndex === 0}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            backgroundColor: currentQuestionIndex === 0 ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Previous
        </button>
        <button
          onClick={() => {
            setCurrentQuestionIndex((prevIndex) =>
              Math.min(prevIndex + 1, quiz.questions.length - 1)
            );
            setSelectedAnswer(null);
          }}
          disabled={currentQuestionIndex === quiz.questions.length - 1}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            backgroundColor: currentQuestionIndex === quiz.questions.length - 1 ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: currentQuestionIndex === quiz.questions.length - 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
