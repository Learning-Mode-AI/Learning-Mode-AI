import {
  askAIQuestion,
  askAIQuestionWithImage,
  showModal,
  updateModalMessage,
} from '../js/content.js';

function showUpgradeModal() {
  console.log('showUpgradeModal called');
  const modalContent = document.getElementById('chat-modal-content');
  modalContent.innerHTML = '';
  const modalTitle = document.createElement('h2');
  modalTitle.id = 'modal-title';
  modalTitle.innerText = 'Out Of Questions';
  modalContent.append(modalTitle);
  const modalCTA = document.createElement('p');
  modalCTA.id = 'modal-cta';
  modalCTA.innerText =
    'Subscribe to get more questions and access to future exclusive features!';
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

  const videoId = new URLSearchParams(new URL(window.location.href).search).get(
    'v'
  );
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

  // Camera Capture Button
  const cameraButton = document.createElement('button');
  cameraButton.className = 'camera-button';
  cameraButton.title = 'Capture current video frame';
  cameraButton.innerHTML = `
    <svg viewBox="0 -2 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>camera</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-258.000000, -467.000000)" fill="#ffffff"> <path d="M286,471 L283,471 L282,469 C281.411,467.837 281.104,467 280,467 L268,467 C266.896,467 266.53,467.954 266,469 L265,471 L262,471 C259.791,471 258,472.791 258,475 L258,491 C258,493.209 259.791,495 262,495 L286,495 C288.209,495 290,493.209 290,491 L290,475 C290,472.791 288.209,471 286,471 Z M274,491 C269.582,491 266,487.418 266,483 C266,478.582 269.582,475 274,475 C278.418,475 282,478.582 282,483 C282,487.418 278.418,491 274,491 Z M274,477 C270.687,477 268,479.687 268,483 C268,486.313 270.687,489 274,489 C277.313,489 280,486.313 280,483 C280,479.687 277.313,477 274,477 L274,477 Z" id="camera" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
  `;

  // Send Button
  const sendButton = document.createElement('button');
  sendButton.className = 'send-button';
  sendButton.innerHTML = '➤';

  // Append input field, camera button, and send button to input area
  inputArea.appendChild(inputField);

  // Camera button in a wrapper for styling
  const cameraWrapper = document.createElement('span');
  cameraWrapper.className = 'camera-wrapper';
  cameraWrapper.appendChild(cameraButton);
  inputArea.appendChild(cameraWrapper);

  inputArea.appendChild(sendButton);

  // Create typing indicator element
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'typing-indicator';
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerText = 'AI is typing...';
  typingIndicator.style.display = 'none';

  // Image context preview (image same height as input, cross on top right, 5px gap below)
  let imageContext = null;
  let imageContextPreview = null;

  // Modal for showing big image
  let imageModal = null;
  function showImageModal(dataURL) {
    if (imageModal) return; // Only allow one modal at a time
    imageModal = document.createElement('div');
    imageModal.style.position = 'fixed';
    imageModal.style.top = '0';
    imageModal.style.left = '0';
    imageModal.style.width = '100vw';
    imageModal.style.height = '100vh';
    imageModal.style.background = 'rgba(0,0,0,0.7)';
    imageModal.style.display = 'flex';
    imageModal.style.alignItems = 'center';
    imageModal.style.justifyContent = 'center';
    imageModal.style.zIndex = '9999';

    const img = document.createElement('img');
    img.src = dataURL;
    img.style.maxWidth = '80vw';
    img.style.maxHeight = '80vh';
    img.style.borderRadius = '12px';
    img.style.boxShadow = '0 4px 32px rgba(0,0,0,0.4)';
    imageModal.appendChild(img);

    // Close modal when clicking outside the image
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) {
        imageModal.remove();
        imageModal = null;
      }
    });

    // Close modal on Escape key
    function handleEscape(e) {
      if (e.key === 'Escape' && imageModal) {
        imageModal.remove();
        imageModal = null;
        document.removeEventListener('keydown', handleEscape);
      }
    }
    document.addEventListener('keydown', handleEscape);

    document.body.appendChild(imageModal);
  }

  function showImageContextPreview(dataURL) {
    if (imageContextPreview) imageContextPreview.remove();

    imageContextPreview = document.createElement('div');
    imageContextPreview.className = 'image-context-preview';
    imageContextPreview.style.display = 'flex';
    imageContextPreview.style.alignItems = 'flex-start';
    imageContextPreview.style.position = 'relative';
    imageContextPreview.style.marginRight = '5px'; // 5px gap below image

    // Get input height
    const inputHeight = inputField.offsetHeight || 36;

    // Image thumbnail with border and border-radius
    const img = document.createElement('img');
    img.src = dataURL;
    img.alt = 'Captured frame';
    img.style.height = inputHeight + 'px';
    img.style.width = 'auto';
    img.style.display = 'block';
    img.style.border = '1.5px solid #ccc';
    img.style.borderRadius = '6px';
    img.style.boxSizing = 'border-box';
    // Show modal with bigger image on click
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling to preview
      showImageModal(dataURL);
    });

    // Cancel (cross) button (black), absolutely positioned on top right of image, only visible on hover
    const crossBtn = document.createElement('span');
    crossBtn.innerHTML = '&times;';
    crossBtn.title = 'Remove image';
    crossBtn.style.position = 'absolute';
    crossBtn.style.top = '4px';
    crossBtn.style.right = '4px';
    crossBtn.style.cursor = 'pointer';
    crossBtn.style.fontSize = '18px';
    crossBtn.style.color = '#000'; // black color
    crossBtn.style.background = 'rgba(255,255,255,0.85)';
    crossBtn.style.borderRadius = '50%';
    crossBtn.style.width = '22px';
    crossBtn.style.height = '22px';
    crossBtn.style.display = 'flex';
    crossBtn.style.alignItems = 'center';
    crossBtn.style.justifyContent = 'center';
    crossBtn.style.zIndex = '2';
    crossBtn.style.border = '1px solid #ccc';
    crossBtn.style.opacity = '0';
    crossBtn.style.transition = 'opacity 0.2s';

    // Show cross only on hover of imageContextPreview
    imageContextPreview.addEventListener('mouseenter', () => {
      crossBtn.style.opacity = '1';
    });
    imageContextPreview.addEventListener('mouseleave', () => {
      crossBtn.style.opacity = '0';
    });

    crossBtn.addEventListener('click', () => {
      imageContext = null;
      if (imageContextPreview) {
        imageContextPreview.remove();
        imageContextPreview = null;
      }
      inputField.focus();
    });

    imageContextPreview.appendChild(img);
    imageContextPreview.appendChild(crossBtn);

    // Insert above input field, with a 5px gap
    inputArea.insertBefore(imageContextPreview, inputField);
  }

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
  const sendQuestion = (questionText) => {
    if (!questionText) return;
    addUserBubble(questionText);
    inputField.value = '';
    const videoUrl = window.location.href;
    typingIndicator.style.display = 'block'; // Show typing indicator

    if (imageContext) {
      askAIQuestionWithImage(videoUrl, questionText, imageContext)
        .then((response) => {
          typingIndicator.style.display = 'none';
          if (response) {
            console.log('AI response received:', response);
          } else {
            console.error('Received undefined AI response');
          }
        })
        .catch((error) => {
          typingIndicator.style.display = 'none';
          if (error.includes('quota')) {
            showUpgradeModal();
            showModal();
          } else {
            //show error as ai bubble
            addAIBubble(
              'Error processing your request. Please try again later.'
            );
          }
        });
    } else {
      askAIQuestion(videoUrl, questionText)
        .then((response) => {
          typingIndicator.style.display = 'none';
          if (response) {
            console.log('AI response received:', response);
          } else {
            console.error('Received undefined AI response');
          }
        })
        .catch((error) => {
          typingIndicator.style.display = 'none';
          if (error.includes('quota')) {
            showUpgradeModal();
            showModal();
          } else {
            addAIBubble(
              'Error processing your request. Please try again later.'
            );
          }
        });
    }
    // After sending, clear image context
    imageContext = null;
    if (imageContextPreview) {
      imageContextPreview.remove();
      imageContextPreview = null;
    }
  };

  // Event lis.tener for send button
  sendButton.addEventListener('click', () => {
    sendQuestion(inputField.value);
  });

  // Event listener for keypress (Enter key)
  inputField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      inputField.value += '\n';
    } else if (event.key === 'Enter' && !event.ctrlKey) {
      event.preventDefault();
      sendQuestion(inputField.value);
    }
  });

  // Camera capture logic
  cameraButton.addEventListener('click', () => {
    const video = document.querySelector('video');
    if (!video) {
      alert('No video element found to capture.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');

    // Set image context for next message
    imageContext = dataURL;
    showImageContextPreview(dataURL);

    // Focus input field so user can type question
    inputField.focus();
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
        chatContainer.style.backgroundImage = `url('${imgURL2}')`;
        chatContainer.classList.add('fullscreen');
        chatContainer.style.position = 'fixed';
        if (featuresPanel) {
          document.body.appendChild(featuresPanel);
          featuresPanel.classList.add('fullscreen');
          featuresPanel.style.position = 'fixed';
        }
      } else {
        if (secondaryInner) {
          secondaryInner.appendChild(chatContainer);
          chatContainer.style.backgroundImage = `url('${imgURL}')`;
          chatContainer.classList.remove('fullscreen');
          chatContainer.style.position = 'relative';
          if (featuresPanel) {
            secondaryInner.appendChild(featuresPanel);
            featuresPanel.classList.remove('fullscreen');
            featuresPanel.style.position = 'relative';
          }
        }
      }
    }
  });

  setTimeout(() => {
    const videoId = new URLSearchParams(
      new URL(window.location.href).search
    ).get('v');
    const key = `chatHistory-${videoId}`;
    const chatArea = document.getElementById('chat-area');

    if (!chatArea || chatArea.dataset.restored === 'true') return;

    restoringHistory = true;

    if (!chatArea || chatArea.dataset.restored === 'true') return;

    restoringHistory = true;

    chrome.storage.local.get([key], (result) => {
      const history = result[key] || [];
      chatArea.innerHTML = ''; // Clear before adding bubbles
      history.forEach((entry) => {
        if (entry.sender === 'user') {
          addUserBubble(entry.message);
        } else {
          addAIBubble(entry.message);
        }
      });

      restoringHistory = false;
      chatArea.dataset.restored = 'true';
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
  console.log('AI bubble added:');
}
