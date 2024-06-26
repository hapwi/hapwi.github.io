import React, { useEffect, useState } from "react";
import shareIcon from "./share-icon.svg"; // Make sure to place the share icon in your src folder

const AddToHomeScreenPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const isIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    const isInStandaloneMode = () =>
      "standalone" in window.navigator && window.navigator.standalone;

    const hasDismissedPrompt = localStorage.getItem("dismissedAddToHomeScreen");

    if (isIOS() && !isInStandaloneMode() && !hasDismissedPrompt) {
      setShowPrompt(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("dismissedAddToHomeScreen", "true");
    setShowPrompt(false);
  };

  return (
    showPrompt && (
      <div className="add-to-home-screen-prompt">
        <div className="prompt-content">
          <p>
            Enjoy quick access to our app by adding it to your home screen. Just
            tap <img src={shareIcon} alt="Share" className="share-icon" /> and
            select <strong>Add to Home Screen</strong>.
          </p>
          <button onClick={handleClose}>Close</button>
        </div>
        <style jsx>{`
          .add-to-home-screen-prompt {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            z-index: 1000;
          }
          .prompt-content {
            text-align: center;
          }
          .share-icon {
            vertical-align: middle;
            width: 1.2em;
            margin: 0 0.2em;
          }
          button {
            margin-top: 10px;
            background: white;
            color: black;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
          }
        `}</style>
      </div>
    )
  );
};

export default AddToHomeScreenPrompt;
