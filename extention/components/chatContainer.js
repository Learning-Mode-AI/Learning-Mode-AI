import { askAIQuestion } from '../js/content.js';

export function createChatContainer(parentElement, width, height) {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'custom-chat-container';
    chatContainer.style.width = `100%`;
    chatContainer.style.height = `600px`;
    chatContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)'; 
    chatContainer.style.borderRadius = '12px';
    chatContainer.style.overflow = 'hidden';
    chatContainer.style.display = 'flex';
    chatContainer.style.flexDirection = 'column';
    chatContainer.style.backgroundColor = '#181818';

    // Chat area for displaying bubbles
    const chatArea = document.createElement('div');
    chatArea.id = 'chat-area';
    chatArea.style.flex = '1';
    chatArea.style.padding = '10px';
    chatArea.style.overflowY = 'auto';
    chatArea.style.color = '#fff';

    // Input area for sending messages
    const inputArea = document.createElement('div');
    inputArea.style.display = 'flex';
    inputArea.style.padding = '10px';
    inputArea.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.id = 'chat-input';
    inputField.placeholder = 'Ask a question...';
    inputField.style.flex = '1';
    inputField.style.padding = '10px';
    inputField.style.borderRadius = '4px';
    inputField.style.border = 'none';
    inputField.style.outline = 'none';
    inputField.style.fontSize = '14px';

    const sendButton = document.createElement('button');
    sendButton.innerText = 'Send';
    sendButton.style.marginLeft = '10px';
    sendButton.style.padding = '10px';
    sendButton.style.border = 'none';
    sendButton.style.borderRadius = '4px';
    sendButton.style.backgroundColor = '#3ea6ff';
    sendButton.style.color = '#fff';
    sendButton.style.cursor = 'pointer';
    sendButton.style.fontSize = '14px';

    // Append input and button to input area
    inputArea.appendChild(inputField);
    inputArea.appendChild(sendButton);

    // Append chat area and input area to chat container
    chatContainer.appendChild(chatArea);
    chatContainer.appendChild(inputArea);

    // Append the chat container to the parent element
    parentElement.appendChild(chatContainer);

    // Add event listener for send button
    sendButton.addEventListener('click', () => {
        const userQuestion = inputField.value;
        if (userQuestion) {
            addUserBubble(userQuestion);
            inputField.value = '';
            const videoUrl = window.location.href;
            askAIQuestion(videoUrl, userQuestion);
        }
    });
}

function addUserBubble(content) {
    const chatArea = document.getElementById('chat-area');
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user-bubble';
    userBubble.style.alignSelf = 'flex-end';
    userBubble.style.backgroundColor = '#3ea6ff';
    userBubble.style.color = '#fff';
    userBubble.style.padding = '10px';
    userBubble.style.borderRadius = '12px';
    userBubble.style.marginBottom = '10px';
    userBubble.style.maxWidth = '70%';

    userBubble.innerText = content;
    chatArea.appendChild(userBubble);
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom
}

function addAIBubble(content) {
    const chatArea = document.getElementById('chat-area');
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai-bubble';
    aiBubble.style.alignSelf = 'flex-start';
    aiBubble.style.backgroundColor = '#444';
    aiBubble.style.color = '#fff';
    aiBubble.style.padding = '10px';
    aiBubble.style.borderRadius = '12px';
    aiBubble.style.marginBottom = '10px';
    aiBubble.style.maxWidth = '70%';

    aiBubble.innerText = content;
    chatArea.appendChild(aiBubble);
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom
}
