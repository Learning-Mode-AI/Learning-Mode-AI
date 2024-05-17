chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: toggleLearningMode
    });
  });
  
  function toggleLearningMode() {
    // Logic to toggle the UI or functionality
  }
  