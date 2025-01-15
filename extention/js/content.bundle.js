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

  // Modal Overlay
  var modalOverlay = document.createElement('div');
  modalOverlay.id = 'chat-modal-overlay';
  var modalContent = document.createElement('div');
  modalContent.id = 'chat-modal-content';
  modalContent.innerText = 'The video is being processed. Please wait...';
  modalOverlay.appendChild(modalContent);
  chatContainer.appendChild(modalOverlay);

  // Header
  var header = document.createElement('div');
  header.className = 'header';

  // Toggle Button
  var toggleButton = document.createElement('button');
  toggleButton.className = 'toggle-button';
  toggleButton.innerHTML = '☰';
  toggleButton.title = 'Toggle Visibility';
  header.appendChild(toggleButton);
  var headerTitle = document.createElement('span');
  headerTitle.innerText = 'Chat-Bot';
  header.appendChild(headerTitle);

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

  // Append input field and button to input area
  inputArea.appendChild(inputField);
  inputArea.appendChild(sendButton);

  // Append all elements
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
  document.addEventListener('fullscreenchange', function () {
    var chatContainer = document.getElementById('custom-chat-container');
    var isFullscreen = !!document.fullscreenElement;
    var secondaryInner = document.getElementById('secondary-inner');
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

/***/ "./components/container2.js":
/*!**********************************!*\
  !*** ./components/container2.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createContainer2: () => (/* binding */ createContainer2)
/* harmony export */ });
function createContainer2(parentElement) {
  var featuresPanel = document.createElement('div');
  featuresPanel.id = 'features-panel';

  // Header
  var header = document.createElement('div');
  header.className = 'features-header';
  var headerTitle = document.createElement('span');
  headerTitle.innerText = 'Use Unique Features';

  // Dropdown button
  var dropdownButton = document.createElement('button');
  dropdownButton.className = 'dropdown-button';
  dropdownButton.innerHTML = '▼'; // Downward arrow
  dropdownButton.title = 'Toggle Options';
  header.appendChild(headerTitle);
  header.appendChild(dropdownButton);

  // Options list
  var optionsList = document.createElement('ul');
  optionsList.className = 'features-options';
  optionsList.style.display = 'none'; // Initially hidden

  var options = ['Fact Check', 'Generate Quiz*', 'Short Summary*', 'Long Summary', 'Get Resources'];
  options.forEach(function (option, index) {
    var optionItem = document.createElement('li');
    optionItem.className = 'feature-option';
    optionItem.innerText = option;
    optionItem.dataset.index = index; // Assign index to each option
    optionsList.appendChild(optionItem);
  });

  // Append header and options list to the panel
  featuresPanel.appendChild(header);
  featuresPanel.appendChild(optionsList);

  // Content holders
  var contentWrapper = document.createElement('div');
  contentWrapper.id = 'content-wrapper';
  var summaryHolder = document.createElement('div');
  summaryHolder.id = 'summary-holder';
  summaryHolder.className = 'feature-content';
  summaryHolder.innerText = 'Summary Holder';
  summaryHolder.style.display = 'none';
  var quizHolder = document.createElement('div');
  quizHolder.id = 'quiz-holder';
  quizHolder.className = 'feature-content';
  quizHolder.innerText = 'Quiz Holder';
  quizHolder.style.display = 'none';
  contentWrapper.appendChild(summaryHolder);
  contentWrapper.appendChild(quizHolder);
  featuresPanel.appendChild(contentWrapper);

  // Append panel to parent element
  parentElement.appendChild(featuresPanel);

  // Toggle options visibility on button click
  dropdownButton.addEventListener('click', function () {
    var isVisible = optionsList.style.display !== 'none';
    optionsList.style.display = isVisible ? 'none' : 'block';
  });

  // Show/hide content on option click
  optionsList.addEventListener('click', function (e) {
    if (e.target && e.target.className.includes('feature-option')) {
      var selectedOption = e.target.dataset.index;

      // Hide all content
      summaryHolder.style.display = 'none';
      quizHolder.style.display = 'none';

      // Show relevant content
      if (selectedOption === '1') {
        // 'Generate Quiz*'
        quizHolder.style.display = 'block';
      } else if (selectedOption === '2') {
        // 'Short Summary*'
        summaryHolder.style.display = 'block';
      }
    }
    optionsList.style.display = 'none'; // Close dropdown after selection
  });
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
/* harmony export */   askAIQuestion: () => (/* binding */ askAIQuestion)
/* harmony export */ });
/* harmony import */ var _components_waitForElement_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../components/waitForElement.js */ "./components/waitForElement.js");
/* harmony import */ var _components_learningModeToggle_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/learningModeToggle.js */ "./components/learningModeToggle.js");
/* harmony import */ var _components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/chatContainer.js */ "./components/chatContainer.js");
/* harmony import */ var _components_container2_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/container2.js */ "./components/container2.js");




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
    showModal();
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
    sendVideoInfoToBackend(videoUrl);
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
      (0,_components_container2_js__WEBPACK_IMPORTED_MODULE_3__.createContainer2)(secondaryInner);
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
function showModal() {
  var modalOverlay = document.getElementById('chat-modal-overlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'flex'; // Show the modal
    console.log('Modal shown');
  } else {
    console.error('Modal overlay not found');
  }
}
function hideModal() {
  var modalOverlay = document.getElementById('chat-modal-overlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none'; // Hide the modal
    console.log('Modal hidden');
  } else {
    console.error('Modal overlay not found');
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
    var status = data.transcription_status;
    console.log('THIS IS THE DATA:', data);
    if (status === 'pending') {
      showModal();
      (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.addAIBubble)('The video is being transcribed. This may take some time, please wait...');
    } else if (status === 'completed') {
      hideModal();
      (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.addAIBubble)('Video Proccessed! You can now ask questions.');
    } else if (status === 'failed') {
      (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.addAIBubble)('Transcription failed. Please try again later.');
    }
  })["catch"](function (error) {
    console.error('Error:', error);
    (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.addAIBubble)('An error occurred while processing the video. Please try again later.');
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