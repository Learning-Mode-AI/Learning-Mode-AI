import { askAIQuestion } from '../js/content.js';

export function createChatContainer(parentElement, width, height) {
    var chatContainer = document.createElement('div');
    chatContainer.id = 'custom-chat-container';
    chatContainer.style.width = "100%";
    chatContainer.style.height = "600px";
    chatContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    chatContainer.style.borderRadius = '12px';
    chatContainer.style.overflow = 'hidden';
    chatContainer.style.display = 'flex';
    chatContainer.style.flexDirection = 'column';
    // Add blur effect with background color
    chatContainer.style.position = "relative"; 
    chatContainer.style.backgroundImage = "url('https://i.imgur.com/ijJQA28.png')";
    chatContainer.style.backgroundSize = "cover";
    chatContainer.style.backgroundPosition = "center";
    chatContainer.style.backgroundRepeat = "no-repeat";
    chatContainer.style.position = "relative";
  
  
    
  
    
    
    // Header section
    const header = document.createElement('div');
    header.style.backgroundColor = '#000';
    header.style.color = '#FFF'; 
    header.style.padding = '10px';
    header.style.fontSize = '16px';
    header.style.fontWeight = 'bold';
    header.style.textAlign = 'center';
    header.innerText = 'Chat-Bot';
  
    // Chat area for displaying bubbles
    var chatArea = document.createElement('div');
    chatArea.id = 'chat-area';
    chatArea.style.flex = '1';
    chatArea.style.padding = '10px';
    chatArea.style.overflowY = 'auto';
    chatArea.style.display = 'flex'; 
    chatArea.style.flexDirection = 'column'; 
    chatArea.style.gap = '10px'; 
    chatArea.style.overflowY = 'auto';
    chatArea.style.color = '#fff';
    
  
   // Input area for sending messages
  const inputArea = document.createElement('div');
  inputArea.style.display = 'flex';
  inputArea.style.alignItems = 'center';
  inputArea.style.padding = '10px';
  inputArea.style.position = 'relative';
  
  // Input field
  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.id = 'chat-input';
  inputField.placeholder = 'Write a message...';
  inputField.style.flex = '1';
  inputField.style.padding = '12px 50px 12px 12px'; // Extra padding for button space
  inputField.style.borderRadius = '25px';
  inputField.style.border = '1px solid #DBDBDB';
  inputField.style.fontSize = '14px';
  inputField.style.outline = 'none';
  
  // Circular send button
  const sendButton = document.createElement('button');
  sendButton.innerHTML = '➤'; // Right arrow icon
  sendButton.style.position = 'absolute';
  sendButton.style.right = '18px'; // Position inside the input
  sendButton.style.width = '35px';
  sendButton.style.height = '35px';
  sendButton.style.border = 'none';
  sendButton.style.borderRadius = '50%'; // Circular shape
  sendButton.style.backgroundColor = '#DD1313'; // Accent color
  sendButton.style.color = '#FFF';
  sendButton.style.fontSize = '16px';
  sendButton.style.cursor = 'pointer';
  sendButton.style.display = 'flex';
  sendButton.style.justifyContent = 'center';
  sendButton.style.alignItems = 'center';
  sendButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
  sendButton.style.transition = 'background-color 0.3s ease';
  
  // Hover effect for button
  sendButton.addEventListener('mouseover', () => {
      sendButton.style.backgroundColor = '#B30F0F';
  });
  sendButton.addEventListener('mouseout', () => {
      sendButton.style.backgroundColor = '#DD1313';
  });
  
  // Append input field and button to input area
  inputArea.appendChild(inputField);
  inputArea.appendChild(sendButton);
  
  
    // Append chat area and input area to chat container
    chatContainer.appendChild(header);
    chatContainer.appendChild(chatArea);
    chatContainer.appendChild(inputArea);
    
  
    // Append the chat container to the parent element
    parentElement.appendChild(chatContainer);
  
    // Add event listener for send button
    sendButton.addEventListener('click', function () {
      var userQuestion = inputField.value;
      if (userQuestion) {
        addUserBubble(userQuestion);
        inputField.value = '';
        var videoUrl = window.location.href;
        (0,_js_content_js__WEBPACK_IMPORTED_MODULE_0__.askAIQuestion)(videoUrl, userQuestion);
      }
    });
  }


function addUserBubble(content) {
    var chatArea = document.getElementById('chat-area');
    var userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user-bubble';
    userBubble.style.alignSelf = 'flex-end';
    userBubble.style.backgroundColor = '#DBDBDB';
    userBubble.style.color = '#1E1E1E';
    userBubble.style.padding = '10px';
    userBubble.style.borderRadius = '12px';
    userBubble.style.marginBottom = '10px';
    userBubble.style.maxWidth = '70%';
    userBubble.style.fontWeight = 'bold';
    userBubble.innerText = content;
    chatArea.appendChild(userBubble);
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom
  }
  export function addAIBubble(content) {
    var chatArea = document.getElementById('chat-area');
    var aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai-bubble';
    aiBubble.style.alignSelf = 'flex-start';
    aiBubble.style.backgroundColor = '#ECB0B0';
    aiBubble.style.color = '#1E1E1E';
    aiBubble.style.padding = '10px';
    aiBubble.style.borderRadius = '12px';
    aiBubble.style.marginBottom = '10px';
    aiBubble.style.maxWidth = '70%';
    aiBubble.style.fontWeight = 'bold';
    aiBubble.innerText = content;
    chatArea.appendChild(aiBubble);
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom
  }
