import React, { useState, useEffect } from 'react';
import './app.css';

const QuizRenderer = ({ quiz, timestamps, videoElement }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionsAtTimestamp, setQuestionsAtTimestamp] = useState([]);
  const [displayedTimestamps, setDisplayedTimestamps] = useState(new Set());

  const TOLERANCE = 0.5;

  useEffect(() => {
    if (timestamps.length > 0 && videoElement) {
      const interval = setInterval(() => {
        const currentTime = videoElement.currentTime;
        timestamps.forEach(({ timestamp }) => {
          if (Math.abs(currentTime - timestamp) <= TOLERANCE && !displayedTimestamps.has(timestamp)) {
            videoElement.pause();
            const matchingQuestions = timestamps.filter((t) => Math.abs(t.timestamp - timestamp) <= TOLERANCE).map((t) => t.index);
            setQuestionsAtTimestamp(matchingQuestions);
            setDisplayedTimestamps((prev) => new Set([...prev, timestamp]));
            setCurrentQuestionIndex(0);
          }
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [timestamps, videoElement, displayedTimestamps]);

  const currentQuestion = quiz?.questions[questionsAtTimestamp[currentQuestionIndex]] || null;

  const correctAnswer =
    currentQuestion &&
    ['A', 'B', 'C', 'D'].includes(currentQuestion.answer)
      ? currentQuestion.options[['A', 'B', 'C', 'D'].indexOf(currentQuestion.answer)].option
      : currentQuestion?.answer;

  const handleAnswer = (option) => setSelectedAnswer(option);

  return (
    <div className="app-container">
      {currentQuestion ? (
        <>
          <h1 className="question-count">Question {currentQuestionIndex + 1}/{questionsAtTimestamp.length}</h1>
          <p className="question-text">{currentQuestion.text}</p>
          {currentQuestion.options.map((option, idx) => (
            <div key={idx} className="option-container">
              <button
                onClick={() => handleAnswer(option.option)}
                className={`option-button ${selectedAnswer === option.option ? (option.option === correctAnswer ? 'correct' : 'incorrect') : ''}`}
              >
                {option.option}
              </button>
              {selectedAnswer === option.option && <div className="explanation"><p>{option.explanation}</p></div>}
            </div>
          ))}
        </>
      ) : (
        <p>No questions available for the current timestamp.</p>
      )}
      <div className="navigation-buttons">
        <button onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))} disabled={currentQuestionIndex === 0} className="nav-button">Previous</button>
        <button onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, questionsAtTimestamp.length - 1))} disabled={currentQuestionIndex === questionsAtTimestamp.length - 1} className="nav-button">Next</button>
      </div>
    </div>
  );
};

export default QuizRenderer;
