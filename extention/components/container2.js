import { generateVideoSummary } from '../js/content.js';

export function createContainer2(parentElement) {
    const featuresPanel = document.createElement('div');
    featuresPanel.id = 'features-panel';

    // Header
    const header = document.createElement('div');
    header.className = 'features-header';

    const headerTitle = document.createElement('span');
    headerTitle.innerText = 'Use Unique Features';

    // Dropdown button
    const dropdownButton = document.createElement('button');
    dropdownButton.className = 'dropdown-button';
    dropdownButton.innerHTML = '▼'; // Downward arrow
    dropdownButton.title = 'Toggle Options';

    header.appendChild(headerTitle);
    header.appendChild(dropdownButton);

    // Options list
    const optionsList = document.createElement('ul');
    optionsList.className = 'features-options';
    optionsList.style.display = 'none'; // Initially hidden

    const options = ['Fact Check', 'Generate Quiz*', 'Short Summary*', 'Long Summary', 'Get Resources'];
    options.forEach((option, index) => {
        const optionItem = document.createElement('li');
        optionItem.className = 'feature-option';
        optionItem.innerText = option;
        optionItem.dataset.index = index; // Assign index to each option
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
    loadingIndicator.className = 'loading-indicator';  // Handled by CSS
    loadingIndicator.innerText = 'Generating summary...';

    const quizHolder = document.createElement('div');
    quizHolder.id = 'quiz-holder';
    quizHolder.className = 'feature-content';
    quizHolder.innerText = 'Quiz Holder';
    quizHolder.style.display = 'none';

    contentWrapper.appendChild(summaryHolder);
    contentWrapper.appendChild(quizHolder);
    contentWrapper.appendChild(loadingIndicator);

    featuresPanel.appendChild(contentWrapper);

    // Append panel to parent element
    parentElement.appendChild(featuresPanel);

    // Toggle options visibility on button click
    dropdownButton.addEventListener('click', () => {
        const isVisible = optionsList.style.display !== 'none';
        optionsList.style.display = isVisible ? 'none' : 'block';
    });

    // Show/hide content on option click
    optionsList.addEventListener('click', (e) => {
        if (e.target && e.target.className.includes('feature-option')) {
            const selectedOption = e.target.dataset.index;

            // Hide all content initially
            summaryHolder.style.display = 'none';
            quizHolder.style.display = 'none';
            
            // Only show loading for 'Short Summary'
            if (selectedOption === '2') { // 'Short Summary*'
                loadingIndicator.style.display = 'block';
                const videoUrl = window.location.href;
                generateVideoSummary(videoUrl, (formattedContent) => {
                    summaryHolder.innerHTML = formattedContent;
                    summaryHolder.style.display = 'block';
                    loadingIndicator.style.display = 'none';
                });
            } else if (selectedOption === '1') { // 'Generate Quiz*'
                quizHolder.style.display = 'block';
            } else if (selectedOption === '0' || selectedOption === '3' || selectedOption === '4') {
                // For 'Fact Check', 'Long Summary', and 'Get Resources', no loading indicator
                summaryHolder.style.display = 'block';
                summaryHolder.innerText = e.target.innerText + " content will be shown here.";
            }

            optionsList.style.display = 'none'; // Close dropdown after selection
        }
    });

}
