import React from 'react';

const MessageLog = ({ messages = [] }) => {
  return (
    <div className="message-log">
      <h2>Message Log</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

export default MessageLog;
