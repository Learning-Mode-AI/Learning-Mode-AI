export function learningModeToggle(toggleLearningMode) {
    const switchButton = document.createElement('button');
    switchButton.className = 'ytp-button learning-mode-switch';
    switchButton.setAttribute('aria-checked', 'false');
    switchButton.setAttribute('aria-label', 'Learning Mode');
    switchButton.setAttribute('title', 'Learning Mode');

    const switchContainer = document.createElement('div');
    switchContainer.className = 'learning-mode-switch-container';

    const toggleCircle = document.createElement('div');
    toggleCircle.className = 'learning-mode-switch-circle';

    switchContainer.appendChild(toggleCircle);
    switchButton.appendChild(switchContainer);

    switchButton.addEventListener('click', toggleLearningMode);

    return switchButton;
}
