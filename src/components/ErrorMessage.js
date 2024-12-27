import React from 'react';
import './ErrorMessage.css';

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-message">
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            重试
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage; 