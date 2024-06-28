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
      <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white p-5 rounded-2xl shadow-lg z-50 max-w-[320px] animate-slideUp">
        <div className="text-center flex flex-col items-center">
          <img
            src="./logo192.png"
            alt="App Logo"
            className="w-16 h-16 mb-4 rounded-2xl border-2 border-white"
          />
          <h3 className="text-lg font-bold mb-2">Add to Home Screen</h3>
          <p className="text-sm mb-4">
            Enjoy quick access to our app by adding it to your home screen.
          </p>
          <div className="flex flex-col items-center mb-4">
            <i
              className="bi bi-box-arrow-up text-blue-300 mb-2"
              style={{
                fontSize: "1.2em",
                verticalAlign: "middle",
                margin: "0 0.2em",
              }}
            ></i>
            <p className="text-sm">
              Tap the share button below, then select{" "}
              <strong>Add to Home Screen</strong>.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-6 rounded-full text-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    )
  );
};

export default AddToHomeScreenPrompt;

<style jsx>{`
  .fixed {
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
  .text-center {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .w-16 {
    width: 4rem;
  }
  .h-16 {
    height: 4rem;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .rounded-2xl {
    border-radius: 1rem;
  }
  .border-2 {
    border-width: 2px;
  }
  .border-white {
    border-color: white;
  }
  .text-lg {
    font-size: 1.125rem;
  }
  .font-bold {
    font-weight: 700;
  }
  .mb-2 {
    margin-bottom: 0.5rem;
  }
  .text-sm {
    font-size: 0.875rem;
  }
  .flex {
    display: flex;
  }
  .flex-col {
    flex-direction: column;
  }
  .items-center {
    align-items: center;
  }
  .bg-gradient-to-r {
    background-image: linear-gradient(to right, var(--tw-gradient-stops));
  }
  .from-blue-500 {
    --tw-gradient-from: #3b82f6;
  }
  .to-purple-500 {
    --tw-gradient-to: #8b5cf6;
  }
  .text-white {
    color: white;
  }
  .py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  .rounded-full {
    border-radius: 9999px;
  }
  .transition-all {
    transition: all 0.3s ease-in-out;
  }
  .duration-300 {
    transition-duration: 300ms;
  }
  .hover\\:shadow-lg:hover {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
  .hover\\:scale-105:hover {
    transform: scale(1.05);
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
`}</style>;
