import React, { useState, useEffect } from 'react';
import './app.css';

export function App() {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [videoElement, setVideoElement] = useState(null);
  const [timestamps, setTimestamps] = useState([]);
  const [questionsAtTimestamp, setQuestionsAtTimestamp] = useState([]);
  const [displayedTimestamps, setDisplayedTimestamps] = useState(new Set());

  const TOLERANCE = 0.5; // Tolerance for matching timestamps

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

        const quizTimestamps = data.questions.map((question, index) => ({
          timestamp: parseTimestamp(question.timestamp),
          index,
        }));
        setTimestamps(quizTimestamps);
      } catch (err) {
        setError('Failed to fetch quiz data.');
      }
    };

    fetchQuiz();

    const video = document.querySelector('video');
    if (video) {
      setVideoElement(video);
    }
  }, []);

  useEffect(() => {
    if (timestamps.length > 0 && videoElement) {
      const interval = setInterval(() => {
        const currentTime = videoElement.currentTime;

        timestamps.forEach(({ timestamp }) => {
          if (
            Math.abs(currentTime - timestamp) <= TOLERANCE &&
            !displayedTimestamps.has(timestamp)
          ) {
            videoElement.pause();
            const matchingQuestions = timestamps
              .filter((t) => Math.abs(t.timestamp - timestamp) <= TOLERANCE)
              .map((t) => t.index);
            console.log('Matching questions:', matchingQuestions); // Debugging log
            setQuestionsAtTimestamp(matchingQuestions);
            setDisplayedTimestamps((prev) => new Set(prev).add(timestamp));
            setCurrentQuestionIndex(0); // Always start with the first question for the current timestamp
          }
        });
      }, 500);

      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [timestamps, videoElement, displayedTimestamps]);

  const parseTimestamp = (timestamp) => {
    const parts = timestamp.split(':');
    return parts.length === 2
      ? parseInt(parts[0], 10) * 60 + parseFloat(parts[1])
      : parseFloat(parts[0]);
  };

  const currentQuestion =
    quiz && questionsAtTimestamp.length > 0
      ? quiz.questions[questionsAtTimestamp[currentQuestionIndex]]
      : null;

  const correctAnswer =
    currentQuestion &&
    ['A', 'B', 'C', 'D'].includes(currentQuestion.answer)
      ? currentQuestion.options[
          ['A', 'B', 'C', 'D'].indexOf(currentQuestion.answer)
        ].option
      : currentQuestion?.answer;

  const handleAnswer = (option) => {
    setSelectedAnswer(option);
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!quiz) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      {currentQuestion ? (
        <>
          <h1 className="question-count">
            Question {currentQuestionIndex + 1}/{questionsAtTimestamp.length}
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
        </>
      ) : (
        <p>No questions available for the current timestamp.</p>
      )}
      <div className="navigation-buttons">
        <button
          onClick={() => {
            setCurrentQuestionIndex((prevIndex) =>
              Math.max(prevIndex - 1, 0)
            );
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
              Math.min(prevIndex + 1, questionsAtTimestamp.length - 1)
            );
            setSelectedAnswer(null);
          }}
          disabled={
            currentQuestionIndex === questionsAtTimestamp.length - 1
          }
          className="nav-button"
        >
          Next
        </button>
      </div>
    </div>
  );
}