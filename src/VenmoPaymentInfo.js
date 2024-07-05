import React, { useState, useEffect } from "react";
import venmoLogo from "./venmo.png";

const VenmoPaymentInfo = () => {
  const venmoUsername = "pblang";
  const venmoDeepLink = `venmo://paycharge?txn=pay&recipients=${venmoUsername}`;
  const venmoWebLink = `https://venmo.com/${venmoUsername}`;
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    setIsIOS(checkIsIOS());
  }, []);

  const handleVenmoClick = (e) => {
    e.preventDefault();

    if (isIOS) {
      window.location.href = venmoDeepLink;
    } else {
      const newTab = window.open(venmoDeepLink, "_blank");

      // If the deep link doesn't work, redirect the new tab to the web link
      setTimeout(() => {
        if (newTab) {
          newTab.location = venmoWebLink;
        } else {
          // If popup was blocked, open in current tab
          window.location.href = venmoWebLink;
        }
      }, 100);
    }
  };

  return (
    <div className="w-full bg-[#3D95CE] rounded-lg p-4">
      <div className="flex justify-center">
        <a
          href={venmoWebLink}
          onClick={handleVenmoClick}
          className="inline-flex items-center bg-white text-[#3D95CE] font-bold py-2 px-4 rounded hover:bg-[#008CFF] hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
        >
          <img src={venmoLogo} alt="Venmo Logo" className="w-6 h-6 mr-2" />
          Pay with Venmo
        </a>
      </div>
      <p className="text-sm text-white mt-2 text-center">
        Easy to collect, easy to send off
      </p>
    </div>
  );
};

export default VenmoPaymentInfo;
