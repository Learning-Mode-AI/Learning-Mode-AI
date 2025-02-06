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
    showModal();
  } else {
    switchButton.setAttribute('aria-checked', 'false');
    switchButton.querySelector(
      '.learning-mode-switch-container'
    ).style.backgroundColor = '#ccc';
    toggleCircle.style.left = '1px';
    deactivateLearningMode();
  }
}

function activateLearningMode() {
  // Fetch user ID from storage or trigger authentication
  getUserId((userId, _) => {
    if (!userId) {
      console.error('User not authenticated.');
    } else {
      console.log('Learning Mode activated for User ID:', userId);
      initializeLearningMode();
    }
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

    sendVideoInfoToBackend(videoUrl);

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
function hideModal() {
  const modalOverlay = document.getElementById('chat-modal-overlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none'; // Hide the modal
    console.log('Modal hidden');
  } else {
    console.error('Modal overlay not found');
  }
}

function sendVideoInfoToBackend(videoUrl) {
  getUserId((userId, email) => {
    if (!userId || !email) {
      console.error('User not authenticated. Unable to send video info.');
      return;
    }

    fetch('http://localhost:8080/processVideo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl: videoUrl, userId: userId }),
    })
      .then((response) => {
        if (response.ok === true) {
          hideModal();
          addAIBubble('Video Proccessed! You can now ask questions.');
        } else {
          addAIBubble('Transcription failed. Please try again later.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
}

export function askAIQuestion(videoUrl, question) {
  const videoId = extractVideoID(videoUrl);

  const videoElement = document.querySelector('video');
  const currentTimestamp = videoElement
    ? Math.floor(videoElement.currentTime)
    : 0;

  getUserId((userId, _) => {
    if (!userId) {
      console.error('User not authenticated. Unable to ask AI question.');
      return;
    }

    fetch('http://localhost:8080/api/question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
        } else {
          console.error('No AI response found in the response data.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
}

function extractVideoID(videoUrl) {
  const videoIDPattern =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = videoUrl.match(videoIDPattern);
  return match ? match[1] : null;
}

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
    body: JSON.stringify({ video_id: videoId, userId: userId }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(
            `Server responded with error: ${response.status} - ${text}`
          );
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
      console.error('Error fetching video summary:', error.message); // Use 'error.message' for clarity
      onError && onError();
    });
}
