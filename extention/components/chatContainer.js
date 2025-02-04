import { askAIQuestion } from '../js/content.js';

export function createChatContainer(parentElement) {
  const chatContainer = document.createElement('div');
  chatContainer.id = 'custom-chat-container';

  // Modal Overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'chat-modal-overlay';

  const modalContent = document.createElement('div');
  modalContent.id = 'chat-modal-content';
  modalContent.innerText = 'The video is being processed. Please wait...';

  modalOverlay.appendChild(modalContent);
  chatContainer.appendChild(modalOverlay);

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

  // Append buttons and title to header
  header.appendChild(toggleButton);
  header.appendChild(headerTitle);

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

  // Create typing indicator element
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'typing-indicator';
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerText = 'AI is typing...';
  typingIndicator.style.display = 'none';

  // Append all elements
  chatContainer.appendChild(header);
  chatContainer.appendChild(chatArea);
  chatContainer.appendChild(typingIndicator);
  chatContainer.appendChild(inputArea);

  parentElement.appendChild(chatContainer);

  // Toggle visibility of chatArea and inputArea
  toggleButton.addEventListener('click', () => {
    const isVisible = chatArea.style.display !== 'none';
    chatArea.style.display = isVisible ? 'none' : 'flex';
    inputArea.style.display = isVisible ? 'none' : 'flex';
    chatContainer.style.height = isVisible ? '50px' : '600px';
  });

  // Handle user sending the question
  const sendQuestion = () => {
    const userQuestion = inputField.value;
    if (userQuestion) {
      addUserBubble(userQuestion);
      inputField.value = '';
      const videoUrl = window.location.href;
      typingIndicator.style.display = 'block'; // Show typing indicator
      askAIQuestion(videoUrl, userQuestion)
        .then((response) => {
          typingIndicator.style.display = 'none';
          if (response) {
            addAIBubble(response);
          } else {
            console.error('Received undefined AI response');
          }
        })
        .catch((error) => {
          typingIndicator.style.display = 'none';
          console.error('Error in askAIQuestion:', error);
        });
    }
  };

  // Event listener for send button
  sendButton.addEventListener('click', sendQuestion);

  // Event listener for keypress (Enter key)
  inputField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      inputField.value += '\n';
    } else if (event.key === 'Enter' && !event.ctrlKey) {
      event.preventDefault();
      sendQuestion();
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
        chatContainer.style.position = 'fixed';
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
