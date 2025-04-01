import React, { useState, useEffect } from 'react';
import QuizRenderer from './QuizRenderer.jsx';

export const QuizFetcher = ({ userId }) => {
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [timestamps, setTimestamps] = useState([]);
  const [videoElement, setVideoElement] = useState(null);

  useEffect(() => {
    const extractVideoId = () => {
      const urlParams = new URL(window.location.href);
      const videoId = urlParams.searchParams.get('v');
      return videoId || urlParams.pathname.substring(1);
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
          headers: { 'Content-Type': 'application/json', 'User-ID': userId },
          body: JSON.stringify({ video_id: videoId, user_id: userId }),
        });
        const data = await response.json();
        setQuiz(data);
        setTimestamps(
          data.questions.map((q, i) => ({
            timestamp: parseTimestamp(q.timestamp),
            index: i,
          }))
        );
      } catch {
        setError('Failed to fetch quiz data.');
      }
    };

    fetchQuiz();
    setVideoElement(document.querySelector('video'));
  }, []);

  const parseTimestamp = (timestamp) => {
    const parts = timestamp.split(':');
    return parts.length === 2
      ? parseInt(parts[0], 10) * 60 + parseFloat(parts[1])
      : parseFloat(parts[0]);
  };

  if (error) return <div className="error">{error}</div>;
  if (!quiz) return <div className="loading">Loading...</div>;

  return (
    <QuizRenderer
      quiz={quiz}
      timestamps={timestamps}
      videoElement={videoElement}
    />
  );
};

export default QuizFetcher;
