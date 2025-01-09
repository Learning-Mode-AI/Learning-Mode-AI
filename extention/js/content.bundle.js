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
  } else {
    switchButton.setAttribute('aria-checked', 'false');
    switchButton.querySelector('.learning-mode-switch-container').style.backgroundColor = '#ccc';
    toggleCircle.style.left = '1px';
    deactivateLearningMode();
  }
}
function activateLearningMode() {
  // Fetch user ID from storage or trigger authentication
  getUserId(function (userId) {
    if (!userId) {
      console.error("User not authenticated. Initiating login process...");
      authenticateUser(function (id) {
        if (id) {
          console.log("User authenticated with ID:", id);
          initializeLearningMode();
        } else {
          console.error("Authentication failed.");
        }
      });
    } else {
      console.log("Learning Mode activated for User ID:", userId);
      initializeLearningMode();
    }
  });
}
function initializeLearningMode() {
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
function sendVideoInfoToBackend(videoUrl) {
  getUserId(function (userId, email) {
    if (!userId || !email) {
      console.error("User not authenticated. Unable to send video info.");
      return;
    }
    fetch('http://localhost:8080/processVideo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videoUrl: videoUrl,
        userId: userId,
        email: email
      })
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      console.log('Success:', data);
    })["catch"](function (error) {
      console.error('Error:', error);
    });
  });
}
function askAIQuestion(videoUrl, question) {
  var videoId = extractVideoID(videoUrl);
  var videoElement = document.querySelector('video');
  var currentTimestamp = videoElement ? Math.floor(videoElement.currentTime) : 0;
  getUserId(function (userId) {
    if (!userId) {
      console.error("User not authenticated. Unable to ask AI question.");
      return;
    }
    fetch('http://localhost:8080/api/question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_id: videoId,
        user_question: question,
        timestamp: currentTimestamp,
        userId: userId
      })
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      return response.json();
    }).then(function (data) {
      var aiResponse = data.response;
      if (aiResponse) {
        (0,_components_chatContainer_js__WEBPACK_IMPORTED_MODULE_2__.addAIBubble)(aiResponse);
        console.log('AI Response:', aiResponse);
      } else {
        console.error('No AI response found in the response data.');
      }
    })["catch"](function (error) {
      console.error('Error:', error);
    });
  });
}
function extractVideoID(videoUrl) {
  var videoIDPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  var match = videoUrl.match(videoIDPattern);
  return match ? match[1] : null;
}
function getUserId(callback) {
  chrome.storage.local.get(["userId", "email"], function (data) {
    if (data.userId && data.email) {
      console.log("User ID and Email found in storage:", data.userId, data.email);
      callback(data.userId, data.email);
    } else {
      console.error("User ID not found. Initiating Google OAuth...");
      chrome.runtime.sendMessage({
        type: "AUTHENTICATE_USER"
      }, function (response) {
        if (response !== null && response !== void 0 && response.userId && response !== null && response !== void 0 && response.email) {
          console.log("Authenticated User ID and Email:", response.userId, response.email);
          callback(response.userId, response.email);
        } else {
          console.error("Authentication failed:", (response === null || response === void 0 ? void 0 : response.error) || "Unknown error");
          callback(null, null);
        }
      });
    }
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