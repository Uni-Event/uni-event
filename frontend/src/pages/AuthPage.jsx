import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import AuthOverlay from "../components/auth/AuthOverlay";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="auth-scope"> 
      <div className={`container ${isSignUp ? "right-panel-active" : ""}`}>
        <RegisterForm
          showPassword={showPassword}
          togglePassword={togglePassword}
          setIsSignUp={setIsSignUp}
        />

        <LoginForm
          showPassword={showPassword}
          togglePassword={togglePassword}
          setIsSignUp={setIsSignUp}
          navigate={navigate}
        />

        <AuthOverlay />
      </div>
    </div>
  );
};

export default AuthPage;