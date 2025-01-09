import { waitForElement } from '../components/waitForElement.js';
import { learningModeToggle } from '../components/learningModeToggle.js';
import { createChatContainer, addAIBubble } from '../components/chatContainer.js';
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
    // Fetch user ID from storage or trigger authentication
    getUserId((userId) => {
        if (!userId) {
            console.error("User not authenticated. Initiating login process...");
            authenticateUser((id) => {
                if (id) {
                    console.log("User authenticated with ID:", id);
                    initializeLearningMode();
                } else {
                    console.error("Authentication failed.");
                }
            });
        } else {
            console.log("Learning Mode activated for User ID:", userId);
            initializeLearningMode();
        }
    });
}

function initializeLearningMode() {
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
        } else {
            if (!chatContainer) {
                createChatContainer(secondaryInner, sidebar.offsetWidth, sidebar.offsetHeight);
            }
            createContainer2(secondaryInner);
        }

        if (sidebar && !isFullscreen) {
            sidebar.style.display = 'none';
        }
    }
}

function deactivateLearningMode() {
    const sidebar = document.getElementById('related');
    const chatContainer = document.getElementById('custom-chat-container');

    if (sidebar) {
        sidebar.style.display = ''; // Show the sidebar
    }
    if (chatContainer) {
        chatContainer.remove(); // Remove the chat container
    }
}

function sendVideoInfoToBackend(videoUrl) {
    getUserId((userId, email) => {
        if (!userId || !email) {
            console.error("User not authenticated. Unable to send video info.");
            return;
        }

        fetch('http://localhost:8080/processVideo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ videoUrl: videoUrl, userId: userId, email: email })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
}


export function askAIQuestion(videoUrl, question) {
    const videoId = extractVideoID(videoUrl);

    const videoElement = document.querySelector('video');
    const currentTimestamp = videoElement ? Math.floor(videoElement.currentTime) : 0;

    getUserId((userId) => {
        if (!userId) {
            console.error("User not authenticated. Unable to ask AI question.");
            return;
        }

        fetch('http://localhost:8080/api/question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                video_id: videoId,
                user_question: question,
                timestamp: currentTimestamp,
                userId: userId
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to get AI response');
                }
                return response.json();
            })
            .then(data => {
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
    const videoIDPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = videoUrl.match(videoIDPattern);
    return match ? match[1] : null;
}

function getUserId(callback) {
    chrome.storage.local.get(["userId", "email"], (data) => {
        if (data.userId && data.email) {
            console.log("User ID and Email found in storage:", data.userId, data.email);
            callback(data.userId, data.email);
        } else {
            console.error("User ID not found. Initiating Google OAuth...");
            chrome.runtime.sendMessage({ type: "AUTHENTICATE_USER" }, (response) => {
                if (response?.userId && response?.email) {
                    console.log("Authenticated User ID and Email:", response.userId, response.email);
                    callback(response.userId, response.email);
                } else {
                    console.error("Authentication failed:", response?.error || "Unknown error");
                    callback(null, null);
                }
            });
        }
    });
}


