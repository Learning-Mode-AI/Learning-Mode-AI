import React, { useState, useEffect, useMemo } from 'react';
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
        
        // handling rewind to display previous questions incase user rewinds
        setDisplayedTimestamps(prev => {
          const newDisplayedTimestamps = new Set();
          for (const t of prev) {
            if (t <= currentTime) {
              newDisplayedTimestamps.add(t);
            }
          }
          return newDisplayedTimestamps;
        });

        timestamps.forEach(({ timestamp, index }) => {
          if (Math.abs(currentTime - timestamp) <= TOLERANCE && !displayedTimestamps.has(timestamp)) {
            videoElement.pause();
            const matchingQuestions = timestamps.filter((t) => Math.abs(t.timestamp - timestamp) <= TOLERANCE).map((t) => t.index);
            
            if (matchingQuestions.length > 0) {
              setQuestionsAtTimestamp(matchingQuestions);
              setDisplayedTimestamps((prev) => new Set([...prev, timestamp]));
              setCurrentQuestionIndex((prev) => 
                prev < matchingQuestions.length - 1 ? prev + 1 : prev
              );
            }
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

  const handleAnswer = (option) => {
    setSelectedAnswer(option);
  };

  // Move selected answer to the top, then color all answers correctly
  const sortedOptions = useMemo(() => {
    if (!selectedAnswer || !currentQuestion) return currentQuestion?.options || [];
    
    const selectedOption = currentQuestion.options.find(option => option.option === selectedAnswer);
    const otherOptions = currentQuestion.options.filter(option => option.option !== selectedAnswer);

    return selectedOption ? [selectedOption, ...otherOptions] : otherOptions;
  }, [selectedAnswer, currentQuestion]);

  return (
    <div className="quiz-container">
      {currentQuestion ? (
        <>
          <h1 className="question-count left-aligned">Question {questionsAtTimestamp[currentQuestionIndex] + 1}</h1>
          <p className="question-text">{currentQuestion.text}</p>

          <div className="quiz-options">
            {sortedOptions.map((option, idx) => (
              <div key={idx} className="option-container">
                <button
                  onClick={() => handleAnswer(option.option)}
                  className={`option-button ${
                    selectedAnswer ? (option.option === correctAnswer ? 'correct' : 'incorrect') : ''
                  }`}
                >
                  {['A)', 'B)', 'C)', 'D)'][idx]} {option.option}
                </button>
                {/* Show explanation only below the selected answer */}
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
