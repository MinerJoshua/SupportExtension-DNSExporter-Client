import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function Popup() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkedAt, setCheckedAt] = useState("");

  const checkLogin = () => {
    chrome.runtime.sendMessage({ ask: "login_status" }, (response) => {
      setLoggedIn(response?.loggedIn || false);
      const now = new Date();
      setCheckedAt(now.toLocaleTimeString()); // or .toLocaleString() for full date/time
    });
  };

  useEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => {
    // Initial check
    chrome.runtime.sendMessage({ ask: "login_status" }, (response) => {
      if (typeof response === "string") {
        setLoggedIn(response === "logged_in");
      }
    });
  
    // Listen for updates from content.js → background.js
    const listener = (msg) => {
      if (msg.status) {
        setLoggedIn(msg.status === "logged_in");
      }
    };
  
    chrome.runtime.onMessage.addListener(listener);
  
    // Clean up when popup is closed
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);
  
  return (
    <div style={{ padding: '16px', fontFamily: 'Arial' }}>
      <h3>{loggedIn ? "✅ Logged in" : "🔒 Not logged in"}</h3>
      <p style={{ fontSize: '0.85em', color: '#555' }}>
        Last checked: {checkedAt}
      </p>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Popup />);