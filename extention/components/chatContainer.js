import { askAIQuestion, showModal, updateModalMessage } from '../js/content.js';

function showUpgradeModal() {
  console.log("showUpgradeModal called");
  const modalContent = document.getElementById('chat-modal-content');
  modalContent.innerHTML = '';
  const modalTitle = document.createElement('h2');
  modalTitle.id = 'modal-title';
  modalTitle.innerText = 'Out Of Questions';
  modalContent.append(modalTitle);
  const modalCTA = document.createElement('p');
  modalCTA.id = 'modal-cta';
  modalCTA.innerText = 'Subscribe to get more questions and access to future exclusive features!';
  modalContent.append(modalCTA);
  const viewPlansButton = document.createElement('button');
  viewPlansButton.id = 'view-plans-button';
  viewPlansButton.innerText = 'View Plans';
  viewPlansButton.onclick = () => {
    window.open('https://learningmodeai.com/', '_blank');
  };
  modalContent.append(viewPlansButton);
}


let restoringHistory = false;

function saveChatHistory(message, sender) {
  if (restoringHistory) return; // prevent duplication while restoring

  const videoId = new URLSearchParams(new URL(window.location.href).search).get('v');
  const key = `chatHistory-${videoId}`;

  chrome.storage.local.get([key], (result) => {
    const history = result[key] || [];
    history.push({ message, sender });

    chrome.storage.local.set({ [key]: history }, () => {
      console.log(`Chat saved for ${videoId}`, history);
    });
  });
}

export function createChatContainer(parentElement) {

  // Prevent duplicate container if already exists
  if (document.getElementById('custom-chat-container')) return;


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
  headerTitle.innerText = 'Ask a Question';

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
          console.log("AI Response received:", response);

          typingIndicator.style.display = 'none';
          console.log("Typing indicator hidden");

          if (response) {
          } else {
            console.error('Received undefined AI response');
          }

        })
        .catch((error) => {
          typingIndicator.style.display = 'none';
          console.error('Error in askAIQuestion:', error);
          console.log("Typing indicator hidden due to error");

          if (error.includes('quota')) {
            showUpgradeModal();
            showModal();
          }
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

  const imgURL = chrome.runtime.getURL('images/bg.png');
  const imgURL2 = chrome.runtime.getURL('images/bg2.png');

  document.addEventListener('fullscreenchange', () => {
    const chatContainer = document.getElementById('custom-chat-container');
    const featuresPanel = document.getElementById('features-panel');
    const isFullscreen = !!document.fullscreenElement;
    const secondaryInner = document.getElementById('secondary-inner');

    if (chatContainer) {
      if (isFullscreen) {
        document.body.appendChild(chatContainer);
        chatContainer.style.backgroundImage = url('${imgURL2}');
        chatContainer.classList.add('fullscreen');
        chatContainer.style.position = 'fixed';
        document.body.appendChild(featuresPanel);
        featuresPanel.classList.add('fullscreen');
        featuresPanel.style.position = 'fixed';
      } else {
        if (secondaryInner) {
          secondaryInner.appendChild(chatContainer);
          chatContainer.style.backgroundImage = url('${imgURL}');
          chatContainer.classList.remove('fullscreen');
          chatContainer.style.position = 'relative';
          secondaryInner.appendChild(featuresPanel);
          featuresPanel.classList.remove('fullscreen');
          featuresPanel.style.position = 'relative';
        }
      }
    }
  });

// Restore chat history without duplication
setTimeout(() => {
  const videoId = new URLSearchParams(new URL(window.location.href).search).get('v');
  const key = `chatHistory-${videoId}`;
  const chatArea = document.getElementById('chat-area');

  if (!chatArea || chatArea.dataset.restored === "true") return;

  restoringHistory = true;

  chrome.storage.local.get([key], (result) => {
    const history = result[key] || [];
    chatArea.innerHTML = ''; // Clear before adding bubbles
    history.forEach(entry => {
      if (entry.sender === 'user') {
        addUserBubble(entry.message);
      } else {
        addAIBubble(entry.message);
      }
    });

    restoringHistory = false;
    chatArea.dataset.restored = "true";
  });
}, 0);



}

export function addUserBubble(content) {
  const chatArea = document.getElementById('chat-area');
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user-bubble';
  userBubble.innerText = content;
  chatArea.appendChild(userBubble);
  chatArea.scrollTop = chatArea.scrollHeight;

  saveChatHistory(content, 'user'); // Save to sessionStorage

}

export function addAIBubble(content) {
  const chatArea = document.getElementById('chat-area');
  const aiBubble = document.createElement('div');
  aiBubble.className = 'chat-bubble ai-bubble';
  aiBubble.innerText = content;
  chatArea.appendChild(aiBubble);
  chatArea.scrollTop = chatArea.scrollHeight;
  
  saveChatHistory(content, 'ai'); // Save to sessionStorage
}
