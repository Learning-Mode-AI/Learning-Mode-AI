function waitForElement(selector, callback) {
    const interval = setInterval(() => {
        if (document.querySelector(selector)) {
            clearInterval(interval);
            callback(document.querySelector(selector));
        }
    }, 100);
}

function addButtonToPlayerControls(playerControls) {
    const button = document.createElement('button');
    button.innerText = 'Learning Mode';
    button.id = 'learning-mode-button';
    button.style = 'padding: 10px; font-size: 12px; background-color: #ff0000; color: white; border: none; border-radius: 2px; cursor: pointer;';
    playerControls.appendChild(button);
    button.addEventListener('click', toggleLearningMode);
}

waitForElement('.ytp-right-controls', addButtonToPlayerControls);

function toggleLearningMode() {
    const sidebar = document.getElementById('related') || document.querySelector('.ytd-watch-flexy');
    if (sidebar.style.display !== 'none') {
        sidebar.style.display = 'none'; // Hide the sidebar
        createLearningPanel(sidebar.offsetWidth, sidebar.offsetHeight); // Create the learning panel
    } else {
        sidebar.style.display = ''; // Show the sidebar
        removeLearningPanel(); // Remove the learning panel
    }
}

function createLearningPanel(width, height) {
    const learningPanel = document.createElement('div');
    learningPanel.id = 'learning-mode-panel';
    learningPanel.style = `width: ${width}px; height: ${height}px; background-color: white; position: absolute; right: 0; top: 56px;`; // You might need to adjust positioning based on page layout
    document.body.appendChild(learningPanel);
}

function removeLearningPanel() {
    const learningPanel = document.getElementById('learning-mode-panel');
    if (learningPanel) {
        learningPanel.remove();
    }
}
