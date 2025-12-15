import React from "react";

const Toast = ({ message }) => {
  if (!message) return null;

  return <div className="toast">{message}</div>;
};

export default Toast;
