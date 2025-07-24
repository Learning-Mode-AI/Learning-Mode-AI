import {
  askAIQuestion,
  askAIQuestionWithFile,
  showModal,
  updateModalMessage,
  showFileErrorMessage,
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

  const sendButton = document.createElement('button');
  sendButton.className = 'send-button';
  sendButton.innerHTML = '➤';

  // File Upload Button
  const fileUploadButton = document.createElement('button');
  fileUploadButton.className = 'file-upload-btn';
  fileUploadButton.innerHTML = '+';
  fileUploadButton.title = 'Attach file for context';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.style.display = 'none';
  fileInput.accept = '.txt,.pdf,.doc,.docx,.md';

  let attachedFile = null;

  // Update file upload button status on creation
  setTimeout(() => updateFileUploadButtonStatus(), 100);

  fileUploadButton.addEventListener('click', () => {
    // Check if button is disabled due to no remaining uploads
    if (fileUploadButton.style.cursor === 'not-allowed') {
      showFileErrorMessage(
        'You have reached your monthly file upload limit. Upgrade for more uploads!',
        'Upload limit reached'
      );
      return;
    }
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (500KB limit)
      const maxSizeKB = 500;
      const fileSizeKB = file.size / 1024;

      if (fileSizeKB > maxSizeKB) {
        showFileErrorMessage(
          `File is too large (${Math.round(
            fileSizeKB
          )}KB). Please choose a file smaller than ${maxSizeKB}KB.`,
          file.name
        );
        fileInput.value = ''; // Clear the input
        return;
      }

      // Validate file type
      const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx', '.md'];
      const fileName = file.name.toLowerCase();
      const isValidType = allowedExtensions.some((ext) =>
        fileName.endsWith(ext)
      );

      if (!isValidType) {
        showFileErrorMessage(
          'Unsupported file type. Please use PDF, TXT, MD, DOC, or DOCX files.',
          file.name
        );
        fileInput.value = ''; // Clear the input
        return;
      }

      // File is valid, attach it
      attachedFile = file;
      fileUploadButton.innerHTML = '+';
      fileUploadButton.classList.add('file-attached');
      fileUploadButton.title = `Attached: ${attachedFile.name}`;
    } else {
      fileUploadButton.innerHTML = '+';
      fileUploadButton.classList.remove('file-attached');
      fileUploadButton.title = 'Attach file for context';
    }
  });

  // Append input field, file upload button, and send button to input area
  inputArea.appendChild(inputField);
  inputArea.appendChild(fileUploadButton);
  inputArea.appendChild(sendButton);
  inputArea.appendChild(fileInput);

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
      if (attachedFile) {
        addFileBubble(attachedFile.name);
      }
      inputField.value = '';
      const videoUrl = window.location.href;
      typingIndicator.style.display = 'block'; // Show typing indicator

      // Choose the appropriate function based on whether a file is attached
      const questionFunction = attachedFile
        ? askAIQuestionWithFile
        : askAIQuestion;
      const questionArgs = attachedFile
        ? [videoUrl, userQuestion, attachedFile]
        : [videoUrl, userQuestion];

      questionFunction(...questionArgs)
        .then((response) => {
          console.log('AI Response received:', response);

          typingIndicator.style.display = 'none';
          console.log('Typing indicator hidden');

          // Reset file attachment state
          if (attachedFile) {
            attachedFile = null;
            fileUploadButton.innerHTML = '+';
            fileUploadButton.classList.remove('file-attached');
            fileUploadButton.title = 'Attach file for context';
            fileInput.value = '';
          }

          if (response) {
          } else {
            console.error('Received undefined AI response');
          }
        })
        .catch((error) => {
          typingIndicator.style.display = 'none';
          console.error('Error in askAIQuestion:', error);
          console.log('Typing indicator hidden due to error');

          // Reset file attachment state on error
          if (attachedFile) {
            attachedFile = null;
            fileUploadButton.innerHTML = '+';
            fileUploadButton.classList.remove('file-attached');
            fileUploadButton.title = 'Attach file for context';
            fileInput.value = '';
          }

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

  // Using setTimeout with 0ms delay to Stop execution until the DOM has fully rendered when refreshing the page.
  // This ensures that chat bubbles are only appended after the container is in place,
  // which prevents duplicate messages from being added when the page is refreshed.
  setTimeout(() => {
    const videoId = new URLSearchParams(
      new URL(window.location.href).search
    ).get('v');
    const key = `chatHistory-${videoId}`;
    const chatArea = document.getElementById('chat-area');

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
}

export function addFileBubble(fileName) {
  const chatArea = document.getElementById('chat-area');
  const fileBubble = document.createElement('div');
  fileBubble.className = 'file-bubble user-bubble';
  fileBubble.innerHTML = `📄 ${fileName}`;
  chatArea.appendChild(fileBubble);
  chatArea.scrollTop = chatArea.scrollHeight;
}
