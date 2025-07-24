import { waitForElement } from '../components/waitForElement.js';
import { learningModeToggle } from '../components/learningModeToggle.js';
import {
  createChatContainer,
  addAIBubble,
} from '../components/chatContainer.js';
import { createContainer2 } from '../components/container2.js';
import { BASE_URL } from './env.js';

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

    setTimeout(() => {
      showModal();
    }, 500);
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
    console.log('Attempting to fetch user info...');
    const user = await chrome.identity.getAuthToken({ interactive: true });
    console.log('User info retrieved successfully:', user);
    return user;
  } catch (error) {
    console.error('User authentication failed:', error);
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

    sendVideoInfoToBackend(window.location.href, userId, userEmail);
    initializeLearningMode(userId);
  });
}

function initializeLearningMode(userId) {
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
        createContainer2(document.body, userId); // Append container2 to body in full-screen
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
        createContainer2(secondaryInner, userId); // Append container2 to the secondary-inner element
        featuresPanel = document.getElementById('features-panel');
      }
      featuresPanel.classList.remove('fullscreen');
    }
  }
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

export function showModal() {
  const modalOverlay = document.getElementById('chat-modal-overlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'flex'; // Show the modal
    console.log('Modal shown');
  } else {
    console.error('Modal overlay not found');
  }
}

export function updateModalMessage(message) {
  const modalContent = document.getElementById('chat-modal-content');
  if (modalContent) {
    modalContent.innerText = message; // Change only the text
  }
}

export function hideModal() {
  const modalOverlay = document.getElementById('chat-modal-overlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none'; // Hide the modal
    console.log('Modal hidden');
  } else {
    console.error('Modal overlay not found');
  }
}

// Function to show error messages with visual feedback
export function showErrorMessage(message, type = 'general', duration = 5000) {
  const chatArea = document.getElementById('chat-area');
  if (!chatArea) {
    console.error('Chat area not found - cannot display error message');
    return;
  }

  // Create error message element
  const errorDiv = document.createElement('div');
  errorDiv.className = `error-message ${type}-error`;
  errorDiv.textContent = message;

  // Add to chat area
  chatArea.appendChild(errorDiv);

  // Scroll to show the error message
  chatArea.scrollTop = chatArea.scrollHeight;

  // Auto-remove after specified duration
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.classList.add('fade-out');
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.remove();
        }
      }, 300); // Wait for fade-out animation
    }
  }, duration);
}

// Function to show file-specific error messages
export function showFileErrorMessage(message, fileName = null) {
  const fullMessage = fileName
    ? `File "${fileName}": ${message}`
    : `File upload error: ${message}`;
  showErrorMessage(fullMessage, 'file', 6000); // Longer duration for file errors
}

function sendVideoInfoToBackend(videoUrl, userId, userEmail) {
  const videoId = extractVideoID(videoUrl);

  // Retrieve processed videos from localStorage  const processedVideos =
  const processedVideos =
    JSON.parse(localStorage.getItem('processedVideos')) || {};
  //Check if video was already processed + cached
  if (processedVideos[videoId]) {
    setTimeout(() => hideModal(), 700);
    console.log(
      `Skipping processVideo: Video ${videoId} was already processed.`
    );
    return;
  }

  console.log(
    `Sending processVideo request for User: ${userId}, Email: ${userEmail}`
  );

  fetch(`${BASE_URL}/processVideo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-ID': userId,

      'User-Email': userEmail,
    },
    body: JSON.stringify({ videoUrl: videoUrl }),
  })
    .then(async (response) => {
      console.log(`Received response: ${response.status}`);

      let responseText;
      try {
        responseText = await response.text(); // Read response as text
      } catch (error) {
        console.error('❌ Failed to read response:', error);
        updateModalMessage('⚠️ Server error. Please try again later.');
        return;
      }

      if (
        response.status === 500 &&
        responseText.includes('Failed to fetch video info')
      ) {
        console.error('🚨 Server error:', responseText);
        updateModalMessage('⚠️ Server error. Please try again later.');
        return;
      }

      if (
        response.status === 400 &&
        responseText.includes('This video is too long')
      ) {
        console.error('🚨 Video exceeds token limit.');
        updateModalMessage('⚠️ This video is too long. Try a shorter one.');
        return;
      }

      if (response.status === 200) {
        console.log('✅ Video processed successfully!');
        hideModal();
        addAIBubble('Video Processed! You can now ask questions.');

        // Mark video as processed in local storage
        processedVideos[videoId] = true;
        localStorage.setItem(
          'processedVideos',
          JSON.stringify(processedVideos)
        );
        console.log('✅ Video marked as processed in local storage');
      }

      // Handle any other error status codes that weren't caught above
      console.error(
        `🚨 Unexpected response status: ${response.status} - ${responseText}`
      );
      updateModalMessage('⚠️ Server error. Please try again later.');
    })
    .catch((error) => {
      console.error('❌ Network or fetch error:', error);
      updateModalMessage(
        '⚠️ Network error. Please check your connection and try again.'
      );
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

      fetch(`${BASE_URL}/api/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-ID': userId,
          'User-Email': userEmail,
        },
        body: JSON.stringify({
          video_id: videoId,
          user_question: question,
          timestamp: currentTimestamp,
          userId: userId,
        }),
      })
        .then((response) => {
          if (response.status === 403) {
            showErrorMessage(
              'You have reached your monthly question limit. Please upgrade to continue.',
              'network'
            );
            reject('User than out of free quota');
            throw new Error('User than out of free quota');
          }
          if (!response.ok) {
            showErrorMessage(
              'Failed to get AI response. Please try again.',
              'network'
            );
            reject('Failed to get AI response');
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
            showErrorMessage(
              'No response received from AI. Please try again.',
              'general'
            );
            reject('No AI response received');
          }
        })
        .catch((error) => {
          console.error('Error in askAIQuestion:', error);
          // Only show error message if we haven't already shown one
          if (
            !error.message.includes('quota') &&
            !error.message.includes('response')
          ) {
            showErrorMessage(
              'Network error occurred. Please check your connection and try again.',
              'network'
            );
          }
          reject(error);
        });
    });
  });
}

export function askAIQuestionWithFile(videoUrl, question, file = null) {
  return new Promise((resolve, reject) => {
    const videoId = extractVideoID(videoUrl);
    const videoElement = document.querySelector('video');
    const currentTimestamp = videoElement
      ? Math.floor(videoElement.currentTime)
      : 0;

    getUserId((userId, userEmail) => {
      if (!userId) {
        console.error('User not authenticated. Unable to ask AI question.');
        reject('User not authenticated');
        return;
      }

      const formData = new FormData();
      formData.append('video_id', videoId);
      formData.append('user_question', question);
      formData.append('timestamp', currentTimestamp);
      formData.append('userId', userId);

      if (file) {
        formData.append('context_file', file);
      }

      fetch(`${BASE_URL}/api/question-with-file`, {
        method: 'POST',
        headers: {
          'User-ID': userId,
          'User-Email': userEmail,
        },
        body: formData,
      })
        .then(async (response) => {
          if (response.status === 403) {
            const errorText = await response.text();
            if (errorText.includes('file upload limit')) {
              showFileErrorMessage(
                'You have reached your monthly file upload limit. Upgrade for more uploads!',
                file?.name
              );
              reject('File upload limit reached');
            } else {
              showErrorMessage(
                'You have reached your monthly question limit. Please upgrade to continue.',
                'network'
              );
              reject('User than out of free quota');
            }
            throw new Error('User has reached limit');
          }
          if (response.status === 413) {
            showFileErrorMessage(
              'File is too large. Please choose a file smaller than 500KB.',
              file?.name
            );
            reject('File too large');
            throw new Error('File too large');
          }
          if (response.status === 415) {
            showFileErrorMessage(
              'Unsupported file type. Please use PDF, TXT, MD, DOC, or DOCX files.',
              file?.name
            );
            reject('Unsupported file type');
            throw new Error('Unsupported file type');
          }
          if (!response.ok) {
            if (file) {
              showFileErrorMessage(
                'Failed to process file. Please try again or contact support.',
                file?.name
              );
            } else {
              showErrorMessage(
                'Failed to get AI response. Please try again.',
                'network'
              );
            }
            reject('Failed to get AI response');
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
            showErrorMessage(
              'No response received from AI. Please try again.',
              'general'
            );
            reject('No AI response received');
          }
        })
        .catch((error) => {
          console.error('Error in askAIQuestionWithFile:', error);
          // Only show error message if we haven't already shown one
          if (
            !error.message.includes('quota') &&
            !error.message.includes('File') &&
            !error.message.includes('response')
          ) {
            if (file) {
              showFileErrorMessage(
                'Network error occurred while processing file. Please check your connection and try again.',
                file?.name
              );
            } else {
              showErrorMessage(
                'Network error occurred. Please check your connection and try again.',
                'network'
              );
            }
          }
          reject(error);
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
      console.log(
        'Next video detected via MutationObserver, turning off Learning Mode...'
      );
      lastVideoId = currentVideoId;
      const switchButton = document.querySelector('.learning-mode-switch');
      if (
        switchButton &&
        switchButton.getAttribute('aria-checked') === 'true'
      ) {
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
      console.log(
        'New video detected via loadeddata event, turning off Learning Mode...'
      );
      lastVideoId = currentVideoId;
      const switchButton = document.querySelector('.learning-mode-switch');
      if (
        switchButton &&
        switchButton.getAttribute('aria-checked') === 'true'
      ) {
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

  fetch(`${BASE_URL}/video-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ video_id: videoId }),
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
      console.error('Error fetching video summary:', error.message);
      onError && onError();
    });
}
