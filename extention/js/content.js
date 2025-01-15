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
        showModal()

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
        sendVideoInfoToBackend(videoUrl); 
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

function showModal() {
    const modalOverlay = document.getElementById('chat-modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex'; // Show the modal
    } else {
        console.error('Modal overlay not found');
    }
}

function hideModal() {
    const modalOverlay = document.getElementById('chat-modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none'; // Hide the modal
    } else {
        console.error('Modal overlay not found');
    }
}

function sendVideoInfoToBackend(videoUrl) {
    fetch('http://localhost:8080/processVideo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: videoUrl })
    })
    //.then(response => response.json())
    .then(response => {
        if (response.ok === true) {
            hideModal();
            addAIBubble('Video Proccessed! You can now ask questions.');
        } else{
            hideModal();
            addAIBubble('Transcription failed. Please try again later.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        addAIBubble('An error occurred while processing the video. Please try again later.');
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
            video_id: videoId,  // Updated to match the backend API's expected field name
            user_question: question,  // Updated to match the backend API's expected field name
            timestamp: currentTimestamp // Current timestamp of the video
        })
    })
    .then(response => {
        // Check if the response is OK and JSON
        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }
        return response.json();  // Parse JSON response
    })
    .then(data => {
        const aiResponse = data.response;  // Extract the AI response from the backend
        if (aiResponse) {
            addAIBubble(aiResponse);  // Add the AI response bubble to the UI
            console.log('AI Response:', aiResponse);
        } else {
            console.error('No AI response found in the response data.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);  // Log any errors for debugging
    });
}


function extractVideoID(videoUrl) {
    // Define the regex to match YouTube video ID in URLs
    const videoIDPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    // Execute the regex pattern to match the video ID
    const match = videoUrl.match(videoIDPattern);

    // Return the video ID if found, otherwise null
    return match ? match[1] : null;
}