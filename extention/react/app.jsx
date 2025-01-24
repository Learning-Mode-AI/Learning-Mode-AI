import React, { useState, useEffect } from 'react';
import './app.css';

export function App() {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const extractVideoId = () => {
      const url = window.location.href;
      const urlParams = new URL(url);
      const videoId = urlParams.searchParams.get('v');
      if (videoId) return videoId;

      const path = urlParams.pathname;
      return path.startsWith('/') ? path.substring(1) : null;
    };

    const videoId = extractVideoId();
    if (!videoId) {
      setError('Invalid YouTube URL: Could not extract video ID.');
      return;
    }

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
    return <div className="error">{error}</div>;
  }

  if (!quiz) {
    return <div className="loading">Loading...</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const correctAnswer =
    ['A', 'B', 'C', 'D'].includes(currentQuestion.answer)
      ? currentQuestion.options[['A', 'B', 'C', 'D'].indexOf(currentQuestion.answer)].option
      : currentQuestion.answer;

  const handleAnswer = (option) => {
    setSelectedAnswer(option);
  };

  return (
    <div className="app-container">
      <h1 className="question-count">
        Question {currentQuestionIndex + 1}/{quiz.questions.length}
      </h1>
      <p className="question-text">{currentQuestion.text}</p>
      {currentQuestion.options.map((option, idx) => (
        <div key={idx} className="option-container">
          <button
            onClick={() => handleAnswer(option.option)}
            className={`option-button ${
              selectedAnswer === option.option
                ? option.option === correctAnswer
                  ? 'correct'
                  : 'incorrect'
                : ''
            }`}
          >
            {option.option}
          </button>
          {selectedAnswer === option.option && (
            <div className="explanation">
              <p>{option.explanation}</p>
            </div>
          )}
        </div>
      ))}
      <div className="navigation-buttons">
        <button
          onClick={() => {
            setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
            setSelectedAnswer(null);
          }}
          disabled={currentQuestionIndex === 0}
          className="nav-button"
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
          className="nav-button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
