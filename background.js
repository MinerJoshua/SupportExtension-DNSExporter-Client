let loginStatus = "unknown"; // default

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // content.js sets status
  if (msg.status) {
    loginStatus = msg.status;
    return;
  }

  // popup.jsx asks for current login state
  if (msg.ask === "login_status") {
    sendResponse(loginStatus);
  }
});
