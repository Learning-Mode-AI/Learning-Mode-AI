import { waitForElement } from '../components/waitForElement.js';
import { learningModeToggle } from '../components/learningModeToggle.js';
import { createChatContainer, addAIBubble } from '../components/chatContainer.js';
import { createContainer2 } from '../components/container2.js';
import { marked } from 'marked'; // Import the Marked library for Markdown rendering

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
        switchButton.querySelector('.learning-mode-switch-container').style.backgroundColor = '#ECB0B0';
        toggleCircle.style.left = '19px';
        activateLearningMode();
    } else {
        switchButton.setAttribute('aria-checked', 'false');
        switchButton.querySelector('.learning-mode-switch-container').style.backgroundColor = '#ccc';
        toggleCircle.style.left = '1px';
        deactivateLearningMode();
    }
}

function activateLearningMode() {
    const sidebar = document.getElementById('related');
    const secondaryInner = document.getElementById('secondary-inner');
    let chatContainer = document.getElementById('custom-chat-container');
    const isFullscreen = !!document.fullscreenElement;

    if (sidebar && secondaryInner) {
        sidebar.style.display = 'none'; // Hide the sidebar

        const videoUrl = window.location.href; // Grab the video URL
        sendVideoInfoToBackend(videoUrl); // Send the video URL to the backend

        if (isFullscreen) {
            if (!chatContainer) {
                createChatContainer(document.body); // Append to body in full-screen
                chatContainer = document.getElementById('custom-chat-container');
                chatContainer.classList.add('fullscreen');
            }
            if (!document.getElementById('features-panel')) {
                createContainer2(document.body); // Append container2 to body in full-screen
            }
        } else {
            if (!chatContainer) {
                createChatContainer(secondaryInner, sidebar.offsetWidth, sidebar.offsetHeight);
            }
            if (!document.getElementById('features-panel')) {
                createContainer2(secondaryInner); // Append container2 to the secondary-inner element
            }
        }

        if (sidebar && !isFullscreen) {
            sidebar.style.display = 'none';
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

function sendVideoInfoToBackend(videoUrl) {
    fetch('http://localhost:8080/processVideo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoUrl: videoUrl })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

export function askAIQuestion(videoUrl, question) {
    // Make sure videoUrl is properly formatted and extractVideoID is defined correctly
    const videoId = extractVideoID(videoUrl);

     // Access the video element to grab the current timestamp
    const videoElement = document.querySelector('video');
    const currentTimestamp = videoElement ? Math.floor(videoElement.currentTime) : 0; // Default to 0 if video element not found

    // Make a POST request to the backend API
    fetch('http://localhost:8080/api/question', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            video_id: videoId,
            user_question: question,
            timestamp: currentTimestamp,
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
            }
        })
        .catch((error) => {
            console.error('Error fetching AI response:', error);
        });
}

export function generateVideoSummary(videoUrl, onSuccess, onError) {
    const videoId = extractVideoID(videoUrl);
    const summaryHolder = document.getElementById('summary-holder');
    const loadingIndicator = document.getElementById('loading-indicator');
    if (!videoId) {
        console.error('Invalid video URL: Unable to extract video ID');
        if (summaryHolder) {
            summaryHolder.innerText = 'Error: Unable to extract video ID.';
            summaryHolder.style.display = 'block';
        }
        return;
    }

    // Check if the summary is already stored in local storage
    const storedSummary = localStorage.getItem(`summary_${videoId}`);
    if (storedSummary) {
        console.log('Using cached summary from local storage.');
        if (summaryHolder) {
            summaryHolder.innerHTML = marked(storedSummary);
            summaryHolder.style.display = 'block';
            loadingIndicator.style.display = 'none';
        }
        onSuccess && onSuccess(marked(storedSummary));
        return;
    }

    // If no stored summary, fetch from the API
    console.log('Fetching summary from server for:', videoId); 

    fetch('http://localhost:8080/video-summary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_id: videoId }),
    })
        .then((response) => {
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
                summaryHolder.innerHTML = marked(data.summary); // Render using 'marked'
                summaryHolder.style.display = 'block';
                onSuccess && onSuccess(data.summary);
            } else {
                summaryHolder.innerText = 'No summary available for this video.';
                summaryHolder.style.display = 'block';
                onError && onError();
            }
        })
        .catch((error) => {
            console.error('Error fetching video summary:', error.message);  // Use 'error.message' for clarity
            if (summaryHolder) {
                summaryHolder.innerText = 'Error fetching video summary.';
                summaryHolder.style.display = 'block';
            }
            onError && onError();
        });
}

function extractVideoID(videoUrl) {
    const videoIDPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = videoUrl.match(videoIDPattern);
    return match ? match[1] : null;
}
