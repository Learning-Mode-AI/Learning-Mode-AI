import { generateVideoSummary } from '../js/content.js';
import { marked } from 'marked'; // Ensure this import exists at the top
import { createRoot } from 'react-dom/client';
import { QuizFetcher } from '../react/QuizFetcher.jsx';
import React from 'react';
import { BASE_URL } from '../js/env.js';


export function createContainer2(parentElement) {

  const featuresPanel = document.createElement('div');
  featuresPanel.id = 'features-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'features-header';

  const headerTitle = document.createElement('span');
  headerTitle.innerText = 'Reinforce Your Learning';

  // Dropdown button
  const dropdownButton = document.createElement('button');
  dropdownButton.className = 'dropdown-button';
  dropdownButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>'; // Hamburger icon
  dropdownButton.title = 'Toggle Options';

  header.appendChild(headerTitle);
  header.appendChild(dropdownButton);


  // Options list
  const optionsList = document.createElement('ul');
  optionsList.className = 'features-options';
  optionsList.style.display = 'none';

  const options = [
    'Fact Check',
    'Generate Quiz',
    'Short Summary',
    'Long Summary',
    'Get Resources',
  ];
  options.forEach((option, index) => {
    const optionItem = document.createElement('li');
    optionItem.className = 'feature-option';
    optionItem.innerText = option;
    optionItem.dataset.index = index;
    optionsList.appendChild(optionItem);
  });

  // Append header and options list to the panel
  featuresPanel.appendChild(header);
  featuresPanel.appendChild(optionsList);

  // Content holders
  const contentWrapper = document.createElement('div');
  contentWrapper.id = 'content-wrapper';
  // Fetch the same background image used in the chatbot
  const bgURL = chrome.runtime.getURL('images/bg.png');

  // Apply background style
  contentWrapper.style.backgroundImage = `url('${bgURL}')`;
  contentWrapper.style.backgroundSize = 'cover';
  contentWrapper.style.backgroundPosition = 'center';
  contentWrapper.style.backgroundRepeat = 'no-repeat';

  // Create and append welcomeView first
  const welcomeView = document.createElement('div');
  welcomeView.className = 'welcome-view';
  welcomeView.innerHTML = `
    <div class="welcome-message">Click Here!</div>
    <img src="${chrome.runtime.getURL('images/arrow.png')}" class="curved-arrow" alt="arrow"/>
  `;
  contentWrapper.appendChild(welcomeView);

  // Then create and append other content holders
  const summaryHolder = document.createElement('div');
  summaryHolder.id = 'summary-holder';
  summaryHolder.className = 'minimal-summary';
  summaryHolder.style.display = 'none';

  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loading-indicator';
  loadingIndicator.className = 'loading-indicator';

  const quizHolder = document.createElement('div');
  quizHolder.id = 'quiz-holder';
  quizHolder.className = 'feature-content';
  quizHolder.style.display = 'none';


  contentWrapper.appendChild(quizHolder);
  contentWrapper.appendChild(summaryHolder);
  contentWrapper.appendChild(loadingIndicator);

  featuresPanel.appendChild(contentWrapper);

  // Append panel to parent element
  parentElement.appendChild(featuresPanel);


  // Feature controls
  const featuresWithInterestButton = [
    'Fact Check',
    'Long Summary',
    'Get Resources',
  ];
  const activeFeatures = ['Short Summary', 'Generate Quiz'];
  const featuresWithLoading = ['Short Summary'];

  // Toggle options visibility
  // Ensure dropdown has a higher z-index
  dropdownButton.addEventListener('click', () => {
    optionsList.style.zIndex = '2000'; // Set higher z-index than the summaryHolder
    optionsList.style.display =
      optionsList.style.display === 'none' ? 'block' : 'none';
  });

  // Show/hide content on option click
  optionsList.addEventListener('click', (e) => {
    const selectedOption = e.target.innerText;

    if (selectedOption) {
      // Close the dropdown menu automatically
      optionsList.style.display = 'none';

      /// Reset visibility and scrollable state, and remove 'coming-soon' styling
      welcomeView.style.display = 'none';
      summaryHolder.style.display = 'none';
      quizHolder.style.display = 'none';
      loadingIndicator.style.display = 'none';
      summaryHolder.classList.remove('coming-soon');
      summaryHolder.classList.remove('scrollable');
      summaryHolder.style.overflowY = 'auto';

      // Show loading if required for the feature
      if (featuresWithLoading.includes(selectedOption)) {
        loadingIndicator.innerText = `Loading ${selectedOption}...`;
        loadingIndicator.style.display = 'block';
      }

      // Check if the selected feature is an active feature
      if (activeFeatures.includes(selectedOption)) {
        if (selectedOption === 'Short Summary') {
          const videoUrl = window.location.href;
          generateVideoSummary(
            videoUrl,
            (formattedContent) => {
              summaryHolder.innerHTML = marked(formattedContent);
              summaryHolder.classList.add('scrollable'); // Enable scrollbar for summary
              summaryHolder.style.overflowY = 'auto';
              summaryHolder.style.display = 'block';
              loadingIndicator.style.display = 'none'; // Hide loading indicator
            },
            () => {
              summaryHolder.innerText = 'Failed to Generate Summary';
              loadingIndicator.style.display = 'none'; // Hide loading indicator
            }
          );
        } else if (selectedOption === 'Generate Quiz') {
          quizHolder.style.display = 'block';
          const quizRoot = createRoot(quizHolder);


          quizRoot.render(<QuizFetcher key={Date.now()} />); // Re-render the QuizFetcher component
          console.log('Quiz generated');

          return;
        }

        summaryHolder.classList.add('scrollable');
        summaryHolder.style.overflowY = 'auto';
        return; // Prevent further actions for active features
      }

      // If the feature is a "Coming Soon" feature with new layout
      summaryHolder.classList.add('coming-soon');
      summaryHolder.style.display = 'flex';
      summaryHolder.style.overflow = 'hidden'; // Prevent scrollbars only for coming soon
      summaryHolder.innerHTML = `
            <div class="coming-soon-feature">
                <div class="feature-title">${selectedOption}</div>
                <img src="https://cdn-icons-png.flaticon.com/512/9541/9541346.png" 
                    alt="Rocket Icon" class="rocket-icon" />
                <p class="coming-soon-text"><strong>Coming Soon</strong></p>
                <p class="interest-question">Is this something you would use?</p>
                <button class="show-interest-button" data-feature="${selectedOption}">Show Interest</button>
            </div>
        `;

      // Add the Show Interest button functionality
      summaryHolder
        .querySelector('.show-interest-button')
        .addEventListener('click', function () {
          fetch(`${BASE_URL}/api/show-interest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feature: selectedOption }),
          })
            .then((response) => response.json())
            .then((data) =>
              alert(`Thank you for your interest in ${selectedOption}!`)
            )
            .catch((error) => console.error('Error:', error));
        });

      // Final fallback to ensure loading indicator is hidden
      loadingIndicator.style.display = 'none';
    }
  });


}
