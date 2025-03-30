export function learningModeToggle(toggleLearningMode) {
  const switchButton = document.createElement('button');
  switchButton.className = 'ytp-button learning-mode-switch';
  switchButton.setAttribute('aria-checked', 'false');
  switchButton.setAttribute('aria-label', 'Learning Mode');
  switchButton.setAttribute('title', 'Learning Mode');

  const switchContainer = document.createElement('div');
  switchContainer.className = 'learning-mode-switch-container';
  
  // adding initial pulse animation class
  switchContainer.classList.add('initial-pulse');

  const toggleCircle = document.createElement('div');
  toggleCircle.className = 'learning-mode-switch-circle';
  
  // adding icon to the circle
  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL('images/LM-icon-black.png'); // Make sure to add this image to your extension
  icon.alt = 'Learning Mode';
  icon.className = 'toggle-icon';
  toggleCircle.appendChild(icon);

  switchContainer.appendChild(toggleCircle);
  switchButton.appendChild(switchContainer);

  // remove initial pulse after animation completes
  // 3 pulses * 3 seconds each + 0.5s initial delay = 9.5 seconds
  setTimeout(() => {
    switchContainer.classList.remove('initial-pulse');
  }, 9500);

  switchButton.addEventListener('click', () => {
    toggleLearningMode();
    // adding glow effect when clicked
    switchContainer.classList.add('glow');
    setTimeout(() => {
      switchContainer.classList.remove('glow');
    }, 1000);
  });

  return switchButton;
}
