import React, { useState, useEffect, useMemo } from 'react';
import './app.css';

const QuizRenderer = ({ quiz, timestamps, videoElement }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [pausedTimestamps, setPausedTimestamps] = useState(new Set());
  const TOLERANCE = 0.5;
  
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
          const timestamp = sortedTimestamps[i].timestamp;
          if (currentTime >= timestamp) {
            if (Math.abs(currentTime - timestamp) <= TOLERANCE && !pausedTimestamps.has(timestamp)) {
              const questionIndex = sortedTimestamps[i].index;
              setCurrentQuestion(quiz?.questions[questionIndex] || null);
              setCurrentQuestionIndex(i + 1);
              setPausedTimestamps(prev => new Set([...prev, timestamp]));
              videoElement.pause();
              break;
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
  }, [sortedTimestamps, videoElement, quiz, pausedTimestamps]);

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

  const shuffleArray = (array) => {
    return array
      .map(value => ({ value, sort: Math.random() })) // Assign random sort values
      .sort((a, b) => a.sort - b.sort) // Sort by the random values
      .map(({ value }) => value); // Extract values
  };
  
  const sortedOptions = useMemo(() => {
    if (!currentQuestion) return [];
    
    // Shuffle options once per question change
    return shuffleArray(currentQuestion.options);
  }, [currentQuestion]);
  

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
