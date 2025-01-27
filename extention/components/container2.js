import { generateVideoSummary } from '../js/content.js';
import { marked } from 'marked'; // Ensure this import exists at the top

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
  dropdownButton.innerHTML = '▼';
  dropdownButton.title = 'Toggle Options';

  header.appendChild(headerTitle);
  header.appendChild(dropdownButton);

  // Options list
  const optionsList = document.createElement('ul');
  optionsList.className = 'features-options';
  optionsList.style.display = 'none';

  const options = [
    'Fact Check',
    'Generate Quiz*',
    'Short Summary*',
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

  const summaryHolder = document.createElement('div');
  summaryHolder.id = 'summary-holder';
  summaryHolder.className = 'minimal-summary';

  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loading-indicator';
  loadingIndicator.className = 'loading-indicator';

  const quizHolder = document.createElement('div');
  quizHolder.id = 'quiz-holder';
  quizHolder.className = 'feature-content';
  quizHolder.style.display = 'none';

  contentWrapper.appendChild(summaryHolder);
  contentWrapper.appendChild(quizHolder);
  contentWrapper.appendChild(loadingIndicator);

  featuresPanel.appendChild(contentWrapper);

  // Append panel to parent element
  parentElement.appendChild(featuresPanel);

  // Feature controls
  const featuresWithInterestButton = [
    'Fact Check',
    'Long Summary',
    'Get Resources',
    'Generate Quiz*',
  ];
  const activeFeatures = ['Short Summary*'];
  const featuresWithLoading = ['Short Summary*'];

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
        if (selectedOption === 'Short Summary*') {
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
        } else if (selectedOption === 'Generate Quiz*') {
          quizHolder.innerText = 'Generating your quiz...';
          quizHolder.style.display = 'block';
          loadingIndicator.style.display = 'none';
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
          fetch('http://localhost:8080/api/show-interest', {
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
