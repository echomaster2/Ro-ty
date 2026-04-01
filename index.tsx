import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress intrusive MetaMask/Ethereum errors from browser extensions
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && (args[0].includes('MetaMask') || args[0].includes('ethereum'))) {
      return;
    }
    originalError.apply(console, args);
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);