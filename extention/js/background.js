function saveUserDetails(id, email) {
  chrome.storage.local.set({ userId: id, email: email }, () => {
    console.log('User ID and Email saved to storage:', id, email);
  });
}

function authenticateUser(callback) {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError || !token) {
      console.error(
        'OAuth failed:',
        chrome.runtime.lastError?.message || 'No token returned'
      );
      callback({
        error: chrome.runtime.lastError?.message || 'No token returned',
      });
      return;
    }

    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.statusText}`);
        }
        return response.json();
      })
      .then((userInfo) => {
        const userId = userInfo.sub; // Google's unique ID for the user
        const email = userInfo.email; // User's Gmail address
        console.log('User ID:', userId);
        console.log('User Email:', email);

        // Store user ID and email in Chrome storage
        saveUserDetails(userId, email);

        callback({ userId, email });
      })
      .catch((error) => {
        console.error('Failed to fetch user info:', error);
        callback({ error: error.message });
      });
  });
}

// Add a listener for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTHENTICATE_USER') {
    authenticateUser((response) => {
      sendResponse(response);
    });
    return true; // Indicate async response
  }
});
