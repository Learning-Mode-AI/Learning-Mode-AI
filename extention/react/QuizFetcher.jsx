import React, { useState, useEffect } from "react";
import QuizRenderer from "./QuizRenderer.jsx";
// Updated import path: this file now exists
import { getUserId } from "../js/content.js";

export const QuizFetcher = () => {
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

    // Retrieve the current user's ID and email.
    getUserId((userId, userEmail) => {
      if (!userId) {
        setError("User not authenticated.");
        return;
      }

      // Now include the headers when calling the quiz endpoint.
      fetch("http://localhost:8080/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-ID": userId,
          "User-Email": userEmail,
        },
        body: JSON.stringify({ video_id: videoId }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setQuiz(data);
          setTimestamps(
            data.questions.map((q, i) => ({
              timestamp: parseTimestamp(q.timestamp),
              index: i,
            }))
          );
        })
        .catch((err) => {
          console.error("Error fetching quiz data:", err);
          setError("Failed to fetch quiz data.");
        });
    });

    setVideoElement(document.querySelector("video"));
  }, []);

  const parseTimestamp = (timestamp) => {
    const parts = timestamp.split(":");
    return parts.length === 2
      ? parseInt(parts[0], 10) * 60 + parseFloat(parts[1])
      : parseFloat(parts[0]);
  };

  if (error) return <div className="error">{error}</div>;
  if (!quiz) return <div className="loading">Loading...</div>;

  return <QuizRenderer quiz={quiz} timestamps={timestamps} videoElement={videoElement} />;
};

export default QuizFetcher;
