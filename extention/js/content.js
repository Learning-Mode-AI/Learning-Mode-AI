import { waitForElement } from '../components/waitForElement.js';
import { learningModeToggle } from '../components/learningModeToggle.js';
import { createChatContainer, addAIBubble} from '../components/chatContainer.js';
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
        showModal();
    } else {
        switchButton.setAttribute('aria-checked', 'false');
        switchButton.querySelector('.learning-mode-switch-container').style.backgroundColor = '#ccc';
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
    const sidebar = document.getElementById('related');
    const secondaryInner = document.getElementById('secondary-inner');
    let chatContainer = document.getElementById('custom-chat-container');
    const isFullscreen = !!document.fullscreenElement;

    const videoUrl = window.location.href; // Grab the video URL

    getUserInfo((user) => {
        if (!user) {
            console.error("User authentication failed. Cannot send video info.");
            return;
        }

        console.log("Authenticated User:", user);

        if (sidebar && secondaryInner) {
            sidebar.style.display = 'none'; // Hide the sidebar

            sendVideoInfoToBackend(videoUrl, userId, userEmail); // Send the video URL userID and email to the backend

            if (isFullscreen) {
                if (!chatContainer) {
                    createChatContainer(document.body);
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
        }
    })

    fetch('http://localhost:8080/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: extractVideoID(videoUrl) })
    })
    .then(response => response.json())
    .then(data => {
        const quizData = data.questions; // Array of questions with timestamps
        const videoElement = document.querySelector('video');
        const displayedTimestamps = new Set();

        if (videoElement) {
            setInterval(() => {
                const currentTime = Math.floor(videoElement.currentTime);

                quizData.forEach(question => {
                    const questionTime = Math.floor(parseTimestamp(question.timestamp));

                    if (currentTime === questionTime && !displayedTimestamps.has(questionTime)) {
                        videoElement.pause();
                        displayQuestionInQuizHolder(question);
                        displayedTimestamps.add(questionTime);
                    }
                });
            }, 500);
        }
    })
    .catch(error => console.error('Error fetching quiz data:', error));
}

function parseTimestamp(timestamp) {
    const parts = timestamp.split(':');
    return parts.length === 2
        ? parseInt(parts[0], 10) * 60 + parseFloat(parts[1])
        : parseFloat(parts[0]);
}

function displayQuestionInQuizHolder(question) {
    const quizHolder = document.getElementById('quiz-holder');
    if (quizHolder) {
        quizHolder.innerHTML = `
            <div>
                <h3>${question.text}</h3>
                ${question.options.map((option, idx) =>
                    `<button class="quiz-option" data-index="${idx}">${option}</button>`
                ).join('')}
            </div>
        `;
        quizHolder.style.display = 'block';
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


function sendVideoInfoToBackend(videoUrl, userId, userEmail) {
    fetch('http://localhost:8080/processVideo', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-ID': userId // Send userID in headers
        },
        body: JSON.stringify({ videoUrl: videoUrl })
    })
    .then(response => {
        if (response.status === 404) { // User Not Found
            console.log("User not found, creating user...");

            // Create the user first
            createUser(userId, userEmail)
                .then(() => {
                    console.log("User created. Retrying video request...");
                    
                    // Now retry the video processing request
                    sendVideoInfoToBackend(videoUrl, userId, userEmail);
                })
                .catch(error => console.error("Error creating user:", error));
        } else if (response.ok) {
            console.log("Video processed successfully!");
            hideModal();
            addAIBubble('Video Processed! You can now ask questions.');
        } else {
            console.error("Error processing video:", response.statusText);
            addAIBubble('Transcription failed. Please try again later.');
        }
    })
    .catch(error => console.error("Error:", error));
}

// Modify createUser to Register the User in the Backend
function createUser(userId, userEmail) {
    return fetch('http://localhost:8080/createUser', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId, email: userEmail }) //  Send user ID & email
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to create user");
        }
        return response.json();
    })
    .then(data => {
        console.log("User created successfully:", data);
        sendVideoInfoToBackend(window.location.href, userId); // Retry sending the original request
    })
    .catch(error => {
        console.error("Error creating user:", error);
    });
}

export function askAIQuestion(videoUrl, question) {
    // Make sure videoUrl is properly formatted and extractVideoID is defined correctly
    const videoId = extractVideoID(videoUrl);

     // Access the video element to grab the current timestamp
    const videoElement = document.querySelector('video');
    const currentTimestamp = videoElement ? Math.floor(videoElement.currentTime) : 0; // Default to 0 if video element not found

    // Make a POST request to the backend API
    return fetch('http://localhost:8080/api/question', {
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
    if (!videoId) {
        console.error('Invalid video URL: Unable to extract video ID');
        onError && onError();
        return;
    }

    // Check if the summary is already stored in local storage
    const storedSummary = localStorage.getItem(`summary_${videoId}`);
    if (storedSummary) {
        console.log('Using cached summary from local storage.');
        onSuccess && onSuccess(storedSummary);
        return;
    }

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
                onSuccess && onSuccess(data.summary);
            } else {
                onError && onError();
            }
        })
        .catch((error) => {
            console.error('Error fetching video summary:', error.message);  // Use 'error.message' for clarity
            onError && onError();
        });
}

function extractVideoID(videoUrl) {
    const videoIDPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = videoUrl.match(videoIDPattern);
    return match ? match[1] : null;
}
