export function createContainer2(parentElement, react) {
    const imgURL = chrome.runtime.getURL('images/bg.png');

    const featuresPanel = document.createElement('div');
    featuresPanel.id = 'features-panel';
    featuresPanel.style.backgroundImage = `url('${imgURL}')`;
    featuresPanel.style.backgroundSize = 'cover';
    featuresPanel.style.backgroundPosition = 'center';
    featuresPanel.style.backgroundRepeat = 'no-repeat';

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
    summaryHolder.className = 'feature-content';
    summaryHolder.innerText = 'Summary Holder';
    summaryHolder.style.display = 'none';


    contentWrapper.appendChild(summaryHolder);
    featuresPanel.appendChild(contentWrapper);

    // Append panel to parent element
    parentElement.appendChild(featuresPanel);

    // append the react quiz after the features panel has been added to the DOM
    const quizHolder = react(contentWrapper)

    // Toggle options visibility on button click
    dropdownButton.addEventListener('click', () => {
        const isVisible = optionsList.style.display !== 'none';
        optionsList.style.display = isVisible ? 'none' : 'block';
    });

    // Show/hide content on option click
    optionsList.addEventListener('click', (e) => {
        if (e.target && e.target.className.includes('feature-option')) {
            const selectedOption = e.target.dataset.index;

            // Hide all content
            summaryHolder.style.display = 'none';
            quizHolder.style.display = 'none';

            // Show relevant content
            if (selectedOption === '1') { // 'Generate Quiz*'
                quizHolder.style.display = 'block';
            } else if (selectedOption === '2') { // 'Short Summary*'
                summaryHolder.style.display = 'block';
            }
        }
        optionsList.style.display = 'none'; // Close dropdown after selection
    });
}
