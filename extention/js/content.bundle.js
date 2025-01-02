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
/* harmony export */   addUserBubble: () => (/* binding */ addUserBubble),
/* harmony export */   createChatContainer: () => (/* binding */ createChatContainer)
/* harmony export */ });
/* harmony import */ var _js_content_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../js/content.js */ "./js/content.js");

function createChatContainer(parentElement) {
  var chatContainer = document.createElement('div');
  chatContainer.id = 'custom-chat-container';

  // Header
  var header = document.createElement('div');
  header.className = 'header';

  // Toggle Button (☰)
  var toggleButton = document.createElement('button');
  toggleButton.className = 'toggle-button';
  toggleButton.innerHTML = '☰';
  toggleButton.title = 'Toggle Visibility';

  // Header Title
  var headerTitle = document.createElement('span');
  headerTitle.innerText = 'Chat-Bot';

  // Summary Button (Minimalistic Icon)
  var summaryButton = document.createElement('button');
  summaryButton.className = 'summary-button-header';
  summaryButton.title = 'Generate Summary';
  summaryButton.innerHTML = '&#x1F4D6;'; // Unicode book icon for "summary"

  // Append buttons and title to header
  header.appendChild(toggleButton);
  header.appendChild(headerTitle);
  header.appendChild(summaryButton);

  // Chat Area
  var chatArea = document.createElement('div');
  chatArea.id = 'chat-area';

  // Input Area
  var inputArea = document.createElement('div');
  inputArea.className = 'input-area';
  var inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.id = 'chat-input';
  inputField.placeholder = 'Write a message...';
  var sendButton = document.createElement('button');
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
  toggleButton.addEventListener('click', function () {
    var isVisible = chatArea.style.display !== 'none';
    chatArea.style.display = isVisible ? 'none' : 'flex';
    inputArea.style.display = isVisible ? 'none' : 'flex';
    chatContainer.style.height = isVisible ? '50px' : '600px';
  });

  // Event listener for send button
  sendButton.addEventListener('click', function () {
    var userQuestion = inputField.value;
    if (userQuestion) {
      addUserBubble(userQuestion);
      inputField.value = '';
      var videoUrl = window.location.href;
      (0,_js_content_js__WEBPACK_IMPORTED_MODULE_0__.askAIQuestion)(videoUrl, userQuestion);
    }
  });

  // Event listener for summary button
  summaryButton.addEventListener('click', function () {
    var videoUrl = window.location.href;
    (0,_js_content_js__WEBPACK_IMPORTED_MODULE_0__.generateVideoSummary)(videoUrl);
  });
}
function addUserBubble(content) {
  var chatArea = document.getElementById('chat-area');
  var userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user-bubble';
  userBubble.innerText = content;
  chatArea.appendChild(userBubble);
  chatArea.scrollTop = chatArea.scrollHeight;
}
function addAIBubble(content) {
  var chatArea = document.getElementById('chat-area');
  var aiBubble = document.createElement('div');
  aiBubble.className = 'chat-bubble ai-bubble';
  aiBubble.innerText = content;
  chatArea.appendChild(aiBubble);
  chatArea.scrollTop = chatArea.scrollHeight;
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
  var toggleCircle = document.createElement('div');
  toggleCircle.className = 'learning-mode-switch-circle';
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
/* harmony export */   askAIQuestion: () => (/* binding */ askAIQuestion),
/* harmony export */   generateVideoSummary: () => (/* binding */ generateVideoSummary)
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
    switchButton.querySelector('.learning-mode-switch-container').style.backgroundColor = '#ECB0B0';
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
  var chatContainer = document.getElementById('custom-chat-container');
  var isFullscreen = !!document.fullscreenElement;
  if (sidebar && secondaryInner) {
    sidebar.style.display = 'none'; // Hide the sidebar

    var videoUrl = window.location.href; // Grab the video URL
    sendVideoInfoToBackend(videoUrl); // Send the video URL to the backend

    if (isFullscreen) {
      if (!chatContainer) {
        (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.createChatContainer)(document.body); // Append to body in full-screen
        chatContainer = document.getElementById('custom-chat-container');
        chatContainer.classList.add('fullscreen');
      }
    } else {
      if (!chatContainer) {
        (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.createChatContainer)(secondaryInner, sidebar.offsetWidth, sidebar.offsetHeight);
      }
    }
    if (sidebar && !isFullscreen) {
      sidebar.style.display = 'none';
    }
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

  // Access the video element to grab the current timestamp
  var videoElement = document.querySelector('video');
  var currentTimestamp = videoElement ? Math.floor(videoElement.currentTime) : 0; // Default to 0 if video element not found

  // Make a POST request to the backend API
  fetch('http://localhost:8080/api/question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      video_id: videoId,
      // Updated to match the backend API's expected field name
      user_question: question,
      // Updated to match the backend API's expected field name
      timestamp: currentTimestamp // Current timestamp of the video
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
function generateVideoSummary(videoUrl) {
  var videoId = extractVideoID(videoUrl);
  if (!videoId) {
    console.error('Invalid video URL: Unable to extract video ID');
    (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.addAIBubble)('Error: Unable to extract video ID.');
    return;
  }
  console.log('Sending video_id:', videoId); // Debugging log to confirm videoId

  fetch('http://localhost:8080/video-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      video_id: videoId
    }) // Payload matches backend expectation
  }).then(function (response) {
    if (!response.ok) {
      // Log detailed error message from the backend
      response.text().then(function (text) {
        console.error("Server responded with error: ".concat(response.status, " - ").concat(text));
      });
      throw new Error("Failed to fetch video summary: ".concat(response.status));
    }
    return response.json();
  }).then(function (data) {
    console.log('Summary Response:', data); // Debugging log
    var summary = data.summary;
    if (summary) {
      (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.addAIBubble)(summary); // Display summary in chat
    } else {
      (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.addAIBubble)('No summary available for this video.');
    }
  })["catch"](function (error) {
    console.error('Error fetching video summary:', error); // Log the error
    (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.addAIBubble)('Error fetching video summary.');
  });
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