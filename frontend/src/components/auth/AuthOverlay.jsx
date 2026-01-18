import React from "react";
import logo from "../../assets/logo-UniEvent.png";

const AuthOverlay = () => {
  return (
    <div className="overlay-container">
      <div className="overlay">
        {/* LEFT PANEL */}
        <div className="overlay-panel overlay-left">
          <img
            src={logo}
            alt="UniEvent"
            className="brand-logo"
            style={{
              width: "900px",
              maxWidth: "130%",
              height: "auto",
            }}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="overlay-panel overlay-right">
          <img
            src={logo}
            alt="UniEvent"
            className="brand-logo"
            style={{
              width: "900px",
              maxWidth: "130%",
              height: "auto",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthOverlay;
