import { handleExportDns } from './handlers/exportDns.js';

const handlers = {
  EXPORT_DNS: handleExportDns,
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handler = handlers[message.type];
  if (handler) {
    handler(message, sender)
      .then(result => sendResponse(result))
      .catch(err => {
        console.error(err);
        sendResponse({ status: 'error', message: err.message });
      });
    return true;
  } else {
    sendResponse({ status: 'error', message: 'Unknown message type' });
  }
});
