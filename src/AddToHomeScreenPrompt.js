import React, { useEffect, useState } from "react";

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
          <img src="./logo192.png" alt="App Logo" className="prompt-logo" />
          <p>
            Enjoy quick access to our app by adding it to your home screen. Just
            tap{" "}
            <i
              className="bi bi-box-arrow-up"
              style={{
                fontSize: "1.2em",
                verticalAlign: "middle",
                margin: "0 0.2em",
              }}
            ></i>
            and select <strong>Add to Home Screen</strong>.
          </p>
          <button onClick={handleClose} className="close-button">
            Close
          </button>
        </div>
        <style jsx>{`
          .add-to-home-screen-prompt {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            max-width: 90%;
            animation: slideUp 0.5s ease-in-out;
          }
          .prompt-content {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .prompt-logo {
            width: 50px;
            height: 50px;
            margin-bottom: 10px;
          }
          p {
            font-size: 1em;
            margin: 0;
          }
          .close-button {
            margin-top: 15px;
            background: #ff4757;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            transition: background 0.3s;
          }
          .close-button:hover {
            background: #ff6b81;
          }
          @keyframes slideUp {
            from {
              transform: translateX(-50%) translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )
  );
};

export default AddToHomeScreenPrompt;
