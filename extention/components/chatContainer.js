export function createChatContainer(parentElement, width, height) {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'custom-chat-container';
    chatContainer.style.width = `100%`;
    chatContainer.style.height = `600px`;
    chatContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)'; // Light grey border
    chatContainer.style.borderRadius = '12px';
    chatContainer.style.overflow = 'hidden';
    chatContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    chatContainer.style.backgroundColor = '#181818'; // Dark background
    chatContainer.style.display = 'flex'; // Flexbox to center content
    chatContainer.style.justifyContent = 'center'; // Center horizontally
    chatContainer.style.alignItems = 'center'; // Center vertically
    chatContainer.style.color = '#fff'; // White text color
    chatContainer.style.fontSize = '14px';
    chatContainer.style.padding = '10px';
    chatContainer.style.boxSizing = 'border-box'; // Ensure padding doesn't affect size

    const chatContent = document.createElement('div');
    chatContent.innerHTML = '<p>Welcome to the Learning Mode Chat!</p>';

    chatContainer.appendChild(chatContent);

    // Append the chat container to the parent element
    parentElement.appendChild(chatContainer);
}
