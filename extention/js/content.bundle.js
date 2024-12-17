/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./components/chatContainer.js":
/*!*************************************!*\
  !*** ./components/chatContainer.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addAIBubble: () => (/* binding */ addAIBubble),
/* harmony export */   createChatContainer: () => (/* binding */ createChatContainer)
/* harmony export */ });
/* harmony import */ var _js_content_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../js/content.js */ "./js/content.js");

function createChatContainer(parentElement, width, height) {
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
  chatContainer.style.backgroundColor = 'rgba(236, 176, 176, 0.6)'; // Semi-transparent #ECB0B0
  chatContainer.style.backdropFilter = 'blur(10px)'; // Apply blur effect
  chatContainer.style.webkitBackdropFilter = 'blur(10px)'; // Safari compatibility
  chatContainer.style.borderTop = '1px solid rgba(0, 0, 0, 0.1)'; // Light border on top
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
  userBubble.innerText = content;
  chatArea.appendChild(userBubble);
  chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom
}
function addAIBubble(content) {
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
  aiBubble.innerText = content;
  chatArea.appendChild(aiBubble);
  chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom
}

/***/ }),

/***/ "./components/learningModeToggle.js":
/*!******************************************!*\
  !*** ./components/learningModeToggle.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   learningModeToggle: () => (/* binding */ learningModeToggle)
/* harmony export */ });
function learningModeToggle(toggleLearningMode) {
  var switchButton = document.createElement('button');
  switchButton.className = 'ytp-button learning-mode-switch';
  switchButton.setAttribute('aria-checked', 'false');
  switchButton.setAttribute('aria-label', 'Learning Mode');
  switchButton.setAttribute('title', 'Learning Mode');
  var switchContainer = document.createElement('div');
  switchContainer.className = 'learning-mode-switch-container';
  switchContainer.style.width = '36px';
  switchContainer.style.height = '18px';
  switchContainer.style.backgroundColor = '#ccc';
  switchContainer.style.borderRadius = '9px';
  switchContainer.style.position = 'relative';
  switchContainer.style.cursor = 'pointer';
  switchContainer.style.transition = 'background-color 0.3s';
  var toggleCircle = document.createElement('div');
  toggleCircle.className = 'learning-mode-switch-circle';
  toggleCircle.style.width = '16px';
  toggleCircle.style.height = '16px';
  toggleCircle.style.backgroundColor = '#fff';
  toggleCircle.style.borderRadius = '50%';
  toggleCircle.style.position = 'absolute';
  toggleCircle.style.top = '1px';
  toggleCircle.style.left = '1px';
  toggleCircle.style.transition = 'left 0.3s';
  switchContainer.appendChild(toggleCircle);
  switchButton.appendChild(switchContainer);
  switchButton.addEventListener('click', toggleLearningMode);
  return switchButton;
}

/***/ }),

/***/ "./components/waitForElement.js":
/*!**************************************!*\
  !*** ./components/waitForElement.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   waitForElement: () => (/* binding */ waitForElement)
/* harmony export */ });
function waitForElement(selector, callback) {
  var interval = setInterval(function () {
    var element = document.querySelector(selector);
    if (element) {
      clearInterval(interval);
      callback(element);
    }
  }, 100);
}

/***/ }),

/***/ "./js/content.js":
/*!***********************!*\
  !*** ./js/content.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   askAIQuestion: () => (/* binding */ askAIQuestion)
/* harmony export */ });
/* harmony import */ var _components_waitForElement_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../components/waitForElement.js */ "./components/waitForElement.js");
/* harmony import */ var _components_learningModeToggle_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/learningModeToggle.js */ "./components/learningModeToggle.js");
/* harmony import */ var _components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/chatContainer.js */ "./components/chatContainer.js");



function addButtonToPlayerControls(playerControls) {
  var toggleButton = (0,_components_learningModeToggle_js__WEBPACK_IMPORTED_MODULE_1__.learningModeToggle)(toggleLearningMode);
  playerControls.appendChild(toggleButton);
}
(0,_components_waitForElement_js__WEBPACK_IMPORTED_MODULE_0__.waitForElement)('.ytp-right-controls', addButtonToPlayerControls);
function toggleLearningMode() {
  var switchButton = document.querySelector('.learning-mode-switch');
  var toggleCircle = document.querySelector('.learning-mode-switch-circle');
  var isOn = switchButton.getAttribute('aria-checked') === 'true';
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
  var sidebar = document.getElementById('related');
  var secondaryInner = document.getElementById('secondary-inner');
  if (sidebar && secondaryInner) {
    sidebar.style.display = 'none'; // Hide the sidebar

    var videoUrl = window.location.href; // Grab the video URL
    sendVideoInfoToBackend(videoUrl); // Send the video URL to the backend

    (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.createChatContainer)(secondaryInner, sidebar.offsetWidth, sidebar.offsetHeight);
  }
}
function deactivateLearningMode() {
  var sidebar = document.getElementById('related');
  var chatContainer = document.getElementById('custom-chat-container');
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
    body: JSON.stringify({
      videoUrl: videoUrl
    })
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    console.log('Success:', data);
  })["catch"](function (error) {
    console.error('Error:', error);
  });
}
function askAIQuestion(videoUrl, question) {
  // Make sure videoUrl is properly formatted and extractVideoID is defined correctly
  var videoId = extractVideoID(videoUrl);

  // Make a POST request to the backend API
  fetch('http://localhost:8080/api/question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      video_id: videoId,
      // Updated to match the backend API's expected field name
      user_question: question // Updated to match the backend API's expected field name
    })
  }).then(function (response) {
    // Check if the response is OK and JSON
    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }
    return response.json(); // Parse JSON response
  }).then(function (data) {
    var aiResponse = data.response; // Extract the AI response from the backend
    if (aiResponse) {
      (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.addAIBubble)(aiResponse); // Add the AI response bubble to the UI
      console.log('AI Response:', aiResponse);
    } else {
      console.error('No AI response found in the response data.');
    }
  })["catch"](function (error) {
    console.error('Error:', error); // Log any errors for debugging
  });
}
function extractVideoID(videoUrl) {
  // Define the regex to match YouTube video ID in URLs
  var videoIDPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  // Execute the regex pattern to match the video ID
  var match = videoUrl.match(videoIDPattern);

  // Return the video ID if found, otherwise null
  return match ? match[1] : null;
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./js/content.js");
/******/ 	
/******/ })()
;
//# sourceMappingURL=content.bundle.js.map