import { waitForElement } from '../components/waitForElement.js';
import { learningModeToggle } from '../components/learningModeToggle.js';
import { createChatContainer } from '../components/chatContainer.js';

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
        switchButton.querySelector('.learning-mode-switch-container').style.backgroundColor = '#3ea6ff';
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

    if (sidebar && secondaryInner) {
        sidebar.style.display = 'none'; // Hide the sidebar

        const videoUrl = window.location.href; // Grab the video URL
        sendVideoInfoToBackend(videoUrl); // Send the video URL to the backend

        createChatContainer(secondaryInner, sidebar.offsetWidth, sidebar.offsetHeight);
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

function askAIQuestion(videoUrl, question) {
    fetch('http://localhost:8080/api/question', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoId: extractVideoID(videoUrl), userQuestion: question })
    })
    .then(response => response.json())
    .then(data => {
        console.log('AI Response:', data.response);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}