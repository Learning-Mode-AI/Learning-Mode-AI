export function learningModeToggle(toggleLearningMode) {
    const switchButton = document.createElement('button');
    switchButton.className = 'ytp-button learning-mode-switch';
    switchButton.setAttribute('aria-checked', 'false');
    switchButton.setAttribute('aria-label', 'Learning Mode');
    switchButton.setAttribute('title', 'Learning Mode');

    const switchContainer = document.createElement('div');
    switchContainer.className = 'learning-mode-switch-container';
    switchContainer.style.width = '36px';
    switchContainer.style.height = '18px';
    switchContainer.style.backgroundColor = '#ccc';
    switchContainer.style.borderRadius = '9px';
    switchContainer.style.position = 'relative';
    switchContainer.style.cursor = 'pointer';
    switchContainer.style.transition = 'background-color 0.3s';

    const toggleCircle = document.createElement('div');
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
