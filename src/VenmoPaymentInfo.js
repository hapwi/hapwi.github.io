import React from "react";
import venmoLogo from "./venmo.png";

const VenmoPaymentInfo = () => {
  return (
    <div className="w-full bg-[#3D95CE] rounded-lg p-4">
      <div className="flex justify-center">
        <a
          href="https://venmo.com/pblang"
          target="_blank"
          rel="noreferrer"
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
