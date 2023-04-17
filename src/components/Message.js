import React from "react";
import './Message.css';

const Message = ({ message }) => {
  return (
    <p className="message">{message}</p>
  );
};

export default Message;
