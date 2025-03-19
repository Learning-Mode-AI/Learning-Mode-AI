import React, { useState, useEffect, useMemo } from 'react';
import './app.css';

const QuizRenderer = ({ quiz, timestamps, videoElement }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  const sortedTimestamps = useMemo(() => // sorting timestamps chronologically
    [...timestamps].sort((a, b) => a.timestamp - b.timestamp), 
    [timestamps]
  );

  useEffect(() => {
    if (sortedTimestamps.length > 0 && videoElement) {
      const interval = setInterval(() => {
        const currentTime = videoElement.currentTime;
        
        let currentIndex = -1;
        for (let i = 0; i < sortedTimestamps.length; i++) {
          if (currentTime >= sortedTimestamps[i].timestamp) {
            if (currentTime === sortedTimestamps[i].timestamp) {
              videoElement.pause();
              
            }
            currentIndex = i;
          } else {
            break;
          }
        }

        if (currentIndex >= 0) {
          const questionIndex = sortedTimestamps[currentIndex].index;
          setCurrentQuestion(quiz?.questions[questionIndex] || null);
          setCurrentQuestionIndex(currentIndex + 1);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [sortedTimestamps, videoElement, quiz]);

  useEffect(() => {
    
    setSelectedAnswer(null); // resetting the selected answer when question changes
  }, [currentQuestion]);


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
          <h1 className="question-count left-aligned">Question {currentQuestionIndex}</h1>
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
