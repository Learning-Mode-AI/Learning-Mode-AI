import { waitForElement } from '../components/waitForElement.js';
import { learningModeToggle } from '../components/learningModeToggle.js';
import {
  createChatContainer,
  addAIBubble,
} from '../components/chatContainer.js';
import { createContainer2 } from '../components/container2.js';

function addButtonToPlayerControls(playerControls) {
  const toggleButton = learningModeToggle(toggleLearningMode);
  playerControls.appendChild(toggleButton);
}

waitForElement('.ytp-right-controls', addButtonToPlayerControls);

function toggleLearningMode() {
  const switchButton = document.querySelector('.learning-mode-switch');
  const toggleCircle = document.querySelector('.learning-mode-switch-circle');
  const isOn = switchButton.getAttribute('aria-checked') === 'true';

  if (!isOn) {
    switchButton.setAttribute('aria-checked', 'true');
    switchButton.querySelector(
      '.learning-mode-switch-container'
    ).style.backgroundColor = '#ECB0B0';
    toggleCircle.style.left = '19px';
    activateLearningMode();
    setTimeout(() => {showModal();}, 500); 
  } else {
    switchButton.setAttribute('aria-checked', 'false');
    switchButton.querySelector(
      '.learning-mode-switch-container'
    ).style.backgroundColor = '#ccc';
    toggleCircle.style.left = '1px';
    deactivateLearningMode();
  }
}

async function getUserInfo() {
  try {
    console.log("Attempting to fetch user info...");
    const user = await chrome.identity.getAuthToken({ interactive: true });
    console.log("User info retrieved successfully:", user);
    return user;
  } catch (error) {
    console.error("User authentication failed:", error);
    return null;
  }
}

function activateLearningMode() {
  getUserId((userId, userEmail) => {
    if (!userId || !userEmail) {
      console.error('User not authenticated.');
      return;
    }

    console.log('Learning Mode activated for User ID:', userId);

    const videoId = extractVideoID(window.location.href);

    // Retrieve processed videos from localStorage
    const processedVideos = JSON.parse(localStorage.getItem('processedVideos')) || {};

    if (!processedVideos[videoId]) {
      sendVideoInfoToBackend(window.location.href, userId, userEmail);
      
      // Mark video as processed in local storage
      processedVideos[videoId] = true;
      localStorage.setItem('processedVideos', JSON.stringify(processedVideos));
    } else {
      console.log(`Skipping processVideo: Video ${videoId} was already processed.`);
    }

    initializeLearningMode();
  });
}


function initializeLearningMode() {
  const sidebar = document.getElementById('related');
  const secondaryInner = document.getElementById('secondary-inner');
  let chatContainer = document.getElementById('custom-chat-container');
  let featuresPanel = document.getElementById('features-panel');
  const isFullscreen = !!document.fullscreenElement;

  const imgURL = chrome.runtime.getURL('images/bg.png');
  const imgURL2 = chrome.runtime.getURL('images/bg2.png');

  const videoUrl = window.location.href; // Grab the video URL
  if (sidebar && secondaryInner) {
    sidebar.style.display = 'none';

    if (isFullscreen) {
      if (!chatContainer) {
        createChatContainer(document.body);
        chatContainer = document.getElementById('custom-chat-container');
        chatContainer.style.backgroundImage = `url('${imgURL2}')`;
        chatContainer.style.backgroundSize = 'cover';
        chatContainer.style.backgroundPosition = 'center';
        chatContainer.style.backgroundRepeat = 'no-repeat';
        chatContainer.classList.add('fullscreen');
      }
      if (!featuresPanel) {
        createContainer2(document.body); // Append container2 to body in full-screen
        featuresPanel = document.getElementById('features-panel');

      }
      featuresPanel.classList.add('fullscreen');
    } else {
      if (!chatContainer) {
        createChatContainer(
          secondaryInner,
          sidebar.offsetWidth,
          sidebar.offsetHeight
        );
        chatContainer = document.getElementById('custom-chat-container');
        chatContainer.style.backgroundImage = `url('${imgURL}')`;
        chatContainer.style.backgroundSize = 'cover';
        chatContainer.style.backgroundPosition = 'center';
        chatContainer.style.backgroundRepeat = 'no-repeat';
      }
      if (!featuresPanel) {
        createContainer2(secondaryInner); // Append container2 to the secondary-inner element
        featuresPanel = document.getElementById('features-panel');
      }
      featuresPanel.classList.remove('fullscreen');
    }
  }

  getUserId((userId, userEmail) => {
    if (!userId) {
      console.error('User not authenticated.');
      return;
    }
    fetch('http://localhost:8080/api/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': userId,
        'User-Email': userEmail  // Send user email in headers
      },
      body: JSON.stringify({
        video_id: extractVideoID(videoUrl),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const quizData = data.questions; // Array of questions with timestamps
        const videoElement = document.querySelector('video');
        const displayedTimestamps = new Set();

        if (videoElement) {
          setInterval(() => {
            const currentTime = Math.floor(videoElement.currentTime);

            quizData.forEach((question) => {
              const questionTime = Math.floor(parseTimestamp(question.timestamp));

              if (
                currentTime === questionTime &&
                !displayedTimestamps.has(questionTime)
              ) {
                videoElement.pause();
                displayQuestionInQuizHolder(question);
                displayedTimestamps.add(questionTime);
              }
            });
          }, 500);
        }
      })
      .catch((error) => console.error('Error fetching quiz data:', error));
  });
}


function parseTimestamp(timestamp) {
  const parts = timestamp.split(':');
  return parts.length === 2
    ? parseInt(parts[0], 10) * 60 + parseFloat(parts[1])
    : parseFloat(parts[0]);
}




function deactivateLearningMode() {
  const sidebar = document.getElementById('related');
  const chatContainer = document.getElementById('custom-chat-container');
  const featuresPanel = document.getElementById('features-panel');

  if (sidebar) {
    sidebar.style.display = ''; // Show the sidebar
  }
  if (chatContainer) {
    chatContainer.remove(); // Remove the chat container
  }
  if (featuresPanel) {
    featuresPanel.remove(); // Remove the container2 features panel
  }
}

function showModal() {
  const modalOverlay = document.getElementById('chat-modal-overlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'flex'; // Show the modal
    console.log('Modal shown');
  } else {
    console.error('Modal overlay not found');
  }
}

function updateModalMessage(message) {
  const modalContent = document.getElementById('chat-modal-content');
  if (modalContent) {
    modalContent.innerText = message; // Change only the text
  }
}

function hideModal() {
  const modalOverlay = document.getElementById('chat-modal-overlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none'; // Hide the modal
    console.log('Modal hidden');
  } else {
    console.error('Modal overlay not found');
  }
}


function sendVideoInfoToBackend(videoUrl, userId, userEmail) {
  console.log(`Sending processVideo request for User: ${userId}, Email: ${userEmail}`);

  fetch('http://localhost:8080/processVideo', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'User-ID': userId,
        'User-Email': userEmail  
    },
    body: JSON.stringify({ videoUrl: videoUrl })
})
.then(async response => {
  console.log(`Received response: ${response.status}`);

    let responseText;
    try {
        responseText = await response.text(); // Read response as text
    } catch (error) {
        console.error("❌ Failed to read response:", error);
        updateModalMessage("⚠️ Server error. Please try again later.");
        return;
    }
    
    if (response.status === 400 && responseText.includes("This video is too long")) {
        console.error("🚨 Video exceeds token limit.");
        updateModalMessage("⚠️ This video is too long. Try a shorter one.");
        return;
    }

    if (response.status === 200) {
        console.log("✅ Video processed successfully!");
        hideModal();
        addAIBubble('Video Processed! You can now ask questions.');
        return;
    }

    console.error("❌ Unknown issue detected - Unexpected Response:", responseText);
    updateModalMessage("❌ An unexpected error occurred. Please try again.");
})
.catch(error => {
    console.error("❌ Fetch request failed:", error);
    updateModalMessage("⚠️ Server error. Please try again later.");
});
}


export function askAIQuestion(videoUrl, question) {
  return new Promise((resolve, reject) => {
    const videoId = extractVideoID(videoUrl);
    const videoElement = document.querySelector('video');
    const currentTimestamp = videoElement
      ? Math.floor(videoElement.currentTime)
      : 0;

    getUserId((userId, userEmail) => {
      if (!userId) {
        console.error('User not authenticated. Unable to ask AI question.');
        return;
      }

      fetch('http://localhost:8080/api/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-ID': userId,
          'User-Email': userEmail
        },
        body: JSON.stringify({
          video_id: videoId,
          user_question: question,
          timestamp: currentTimestamp,
          userId: userId,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to get AI response');
          }
          return response.json();
        })
        .then((data) => {
          const aiResponse = data.response;
          if (aiResponse) {
            addAIBubble(aiResponse);
            console.log('AI Response:', aiResponse);
            resolve(aiResponse);  
          } else {
            console.error('No AI response found in the response data.');
            reject('No AI response received');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  });
}

function monitorVideoChange() {
  let lastVideoId = extractVideoID(window.location.href);

  const observer = new MutationObserver(() => {
    const currentVideoId = extractVideoID(window.location.href);
    
    // If the video ID has changed, toggle off Learning Mode
    if (currentVideoId && currentVideoId !== lastVideoId) {
      console.log("Next video detected via MutationObserver, turning off Learning Mode...");
      lastVideoId = currentVideoId;
      const switchButton = document.querySelector('.learning-mode-switch');
      if (switchButton && switchButton.getAttribute('aria-checked') === 'true') {
        toggleLearningMode(); // Turn off Learning Mode
      }
    }
  });

  // Observe changes in the URL bar and YouTube's dynamic content updates
  observer.observe(document.body, { childList: true, subtree: true });

  const videoElement = document.querySelector('video');
  if (!videoElement) return;

  videoElement.addEventListener('loadeddata', () => {
    const currentVideoId = extractVideoID(window.location.href);
    
    if (currentVideoId && currentVideoId !== lastVideoId) {
      console.log("New video detected via loadeddata event, turning off Learning Mode...");
      lastVideoId = currentVideoId;
      const switchButton = document.querySelector('.learning-mode-switch');
      if (switchButton && switchButton.getAttribute('aria-checked') === 'true') {
        toggleLearningMode();
      }
    }
  });
}

function extractVideoID(videoUrl) {
  const videoIDPattern =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = videoUrl.match(videoIDPattern);
  return match ? match[1] : null;
}

monitorVideoChange();

function getUserId(callback) {
  chrome.storage.local.get(['userId', 'email'], (data) => {
    if (data.userId && data.email) {
      console.log(
        'User ID and Email found in storage:',
        data.userId,
        data.email
      );
      callback(data.userId, data.email);
    } else {
      console.error('User ID not found. Initiating Google OAuth...');
      chrome.runtime.sendMessage({ type: 'AUTHENTICATE_USER' }, (response) => {
        if (response?.userId && response?.email) {
          console.log(
            'Authenticated User ID and Email:',
            response.userId,
            response.email
          );
          callback(response.userId, response.email);
        } else {
          console.error(
            'Authentication failed:',
            response?.error || 'Unknown error'
          );
          callback(null, null);
        }
      });
    }
  });
}

export function generateVideoSummary(videoUrl, onSuccess, onError) {
  const videoId = extractVideoID(videoUrl);
  if (!videoId) {
    console.error('Invalid video URL: Unable to extract video ID');
    onError && onError();
    return;
  }

  // Check if the summary is already stored in local storage
  const storedSummary = localStorage.getItem(`summary_${videoId}`);
  if (storedSummary) {
    onSuccess && onSuccess(storedSummary);
    return;
  }

  fetch('http://localhost:8080/video-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ video_id: videoId }),
  }).then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Server responded with error: ${response.status} - ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.summary) {
          localStorage.setItem(`summary_${videoId}`, data.summary);
          onSuccess && onSuccess(data.summary);
        } else {
          onError && onError();
        }
      })
      .catch((error) => {
        console.error('Error fetching video summary:', error.message);
        onError && onError();
      });
  };
