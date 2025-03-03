import React, { useState, useEffect, useMemo, useRef } from 'react';
import './app.css';

const QuizRenderer = ({ quiz, timestamps, videoElement }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionsAtTimestamp, setQuestionsAtTimestamp] = useState([]);
  // Remove displayedTimestamps state and instead use a ref
  const pausedTimestampsRef = useRef(new Set());

  const TOLERANCE = 0.5;

  useEffect(() => {
    if (timestamps.length > 0 && videoElement) {
      const interval = setInterval(() => {
        const currentTime = videoElement.currentTime;
        timestamps.forEach(({ timestamp }, index) => {
          // If the current time is within the tolerance of the timestamp and we haven't paused for this timestamp before...
          if (
            Math.abs(currentTime - timestamp) <= TOLERANCE &&
            !pausedTimestampsRef.current.has(timestamp)
          ) {
            videoElement.pause();
            // Set the current question to the one corresponding to this timestamp
            setQuestionsAtTimestamp([index]);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null); // Reset any previous answer
            // Mark this timestamp as paused
            pausedTimestampsRef.current.add(timestamp);
          }
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [timestamps, videoElement]);

  // Get the current question using the index stored in questionsAtTimestamp
  const currentQuestion = quiz?.questions[questionsAtTimestamp[currentQuestionIndex]] || null;

  // Determine the correct answer from the API data
  const correctAnswer =
    currentQuestion &&
    ['A', 'B', 'C', 'D'].includes(currentQuestion.answer)
      ? currentQuestion.options[['A', 'B', 'C', 'D'].indexOf(currentQuestion.answer)].option
      : currentQuestion?.answer;

  // Handle answer selection
  const handleAnswer = (option) => {
    setSelectedAnswer(option);
  };

  // Prepare the options and add an isCorrect flag
  const sortedOptions = useMemo(() => {
    if (!currentQuestion) return [];
    return currentQuestion.options.map((option) => ({
      ...option,
      isCorrect: option.option === correctAnswer,
    }));
  }, [currentQuestion]);

  return (
    <div className="quiz-container">
      {currentQuestion ? (
        <>
          <h1 className="question-count left-aligned">
            Question {questionsAtTimestamp[0] + 1} {/* Displaying 1-based index */}
          </h1>
          <p className="question-text">{currentQuestion.text}</p>

          <div className="quiz-options">
            {sortedOptions.map((option, idx) => (
              <div key={idx} className="option-container">
                <button
                  onClick={() => handleAnswer(option.option)}
                  className={`option-button ${
                    selectedAnswer
                      ? option.option === correctAnswer
                        ? 'correct'
                        : 'incorrect'
                      : ''
                  }`}
                >
                  {['A)', 'B)', 'C)', 'D)'][idx]} {option.option}
                </button>
                {selectedAnswer === option.option && (
                  <div className="explanation">
                    <p>{option.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>No questions available for the current timestamp.</p>
      )}
    </div>
  );
};

export default QuizRenderer;
