import { askAIQuestion, generateVideoSummary } from '../js/content.js';

export function createChatContainer(parentElement) {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'custom-chat-container';

    // Header
    const header = document.createElement('div');
    header.className = 'header';

    // Toggle Button (☰)
    const toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-button';
    toggleButton.innerHTML = '☰';
    toggleButton.title = 'Toggle Visibility';

    // Header Title
    const headerTitle = document.createElement('span');
    headerTitle.innerText = 'Chat-Bot';

    // Summary Button (Minimalistic Icon)
    const summaryButton = document.createElement('button');
    summaryButton.className = 'summary-button-header';
    summaryButton.title = 'Generate Summary';
    summaryButton.innerHTML = '&#x1F4D6;'; // Unicode book icon for "summary"

    // Append buttons and title to header
    header.appendChild(toggleButton);
    header.appendChild(headerTitle);
    header.appendChild(summaryButton);

    // Chat Area
    const chatArea = document.createElement('div');
    chatArea.id = 'chat-area';

    // Input Area
    const inputArea = document.createElement('div');
    inputArea.className = 'input-area';

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.id = 'chat-input';
    inputField.placeholder = 'Write a message...';

    const sendButton = document.createElement('button');
    sendButton.className = 'send-button';
    sendButton.innerHTML = '➤';

    // Append input field and send button to input area
    inputArea.appendChild(inputField);
    inputArea.appendChild(sendButton);

    // Append header, chat area, and input area to chat container
    chatContainer.appendChild(header);
    chatContainer.appendChild(chatArea);
    chatContainer.appendChild(inputArea);

    parentElement.appendChild(chatContainer);

    // Toggle visibility of chatArea and inputArea
    toggleButton.addEventListener('click', () => {
        const isVisible = chatArea.style.display !== 'none';
        chatArea.style.display = isVisible ? 'none' : 'flex';
        inputArea.style.display = isVisible ? 'none' : 'flex';
        chatContainer.style.height = isVisible ? '50px' : '600px';
    });

    // Event listener for send button
    sendButton.addEventListener('click', () => {
        const userQuestion = inputField.value;
        if (userQuestion) {
            addUserBubble(userQuestion);
            inputField.value = '';
            const videoUrl = window.location.href;
            askAIQuestion(videoUrl, userQuestion);
        }
    });

    // Event listener for summary button
    summaryButton.addEventListener('click', () => {
        const videoUrl = window.location.href;
        generateVideoSummary(videoUrl);
    });
}

export function addUserBubble(content) {
    const chatArea = document.getElementById('chat-area');
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user-bubble';
    userBubble.innerText = content;
    chatArea.appendChild(userBubble);
    chatArea.scrollTop = chatArea.scrollHeight;
}

export function addAIBubble(content) {
    const chatArea = document.getElementById('chat-area');
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai-bubble';
    aiBubble.innerText = content;
    chatArea.appendChild(aiBubble);
    chatArea.scrollTop = chatArea.scrollHeight;
}