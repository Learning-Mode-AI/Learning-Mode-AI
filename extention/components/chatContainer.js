import { askAIQuestion } from '../js/content.js';

export function createChatContainer(parentElement) {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'custom-chat-container';

    // Header
    const header = document.createElement('div');
    header.className = 'header';
    header.innerText = 'Chat-Bot';

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

    // Append input field and button to input area
    inputArea.appendChild(inputField);
    inputArea.appendChild(sendButton);

    // Append all elements
    chatContainer.appendChild(header);
    chatContainer.appendChild(chatArea);
    chatContainer.appendChild(inputArea);

    parentElement.appendChild(chatContainer);

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

    document.addEventListener('fullscreenchange', () => {
        const chatContainer = document.getElementById('custom-chat-container');
        const isFullscreen = !!document.fullscreenElement;
        const secondaryInner = document.getElementById('secondary-inner');

        if (chatContainer) {
            if (isFullscreen) {
                document.body.appendChild(chatContainer);
                chatContainer.classList.add('fullscreen');
            } else {
                if (secondaryInner) {
                    secondaryInner.appendChild(chatContainer);
                    chatContainer.classList.remove('fullscreen');
                    chatContainer.style.position = 'relative';
                }
            }
        }
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