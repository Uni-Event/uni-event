import { useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import api from "../../services/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import { GoogleLogin } from "@react-oauth/google";

const LoginForm = ({ showPassword, togglePassword, setIsSignUp, navigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- LOGIN CLASIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Trimitem cererea de login la Backend
      const res = await api.post("/api/token/", { email, password });

      // 2. Salvăm token-urile primite
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

      // 3. Redirecționăm către pagina principală
      navigate("/");
    } catch (error) {
      alert("Email sau parolă incorectă!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      // Trimitem token-ul primit de la Google la backend
      const res = await api.post("/api/users/google/", {
        token: credentialResponse.credential,
      });

      if (res.status === 200) {
        // Dacă backend-ul a răspuns primim JWT-urile
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

        // Redirectam la Home
        navigate("/");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Autentificarea cu Google a eșuat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleSubmit}>
        <h1>Bine ai revenit!</h1>

        <p className="switch-text">
          Nu ai cont?
          <span onClick={() => setIsSignUp(true)}>Înregistrează-te</span>
        </p>

        <div className="input-group">
          <label>E-mail</label>
          <div className="input-wrapper">
            <input
              type="email"
              placeholder="Introduceți adresa de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FaEnvelope className="icon" />
          </div>
        </div>

        <div className="input-group">
          <label>Parolă</label>
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Introduceți parola"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="icon" onClick={togglePassword}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </div>

        <span className="forgot-password">Ați uitat parola?</span>

        <div style={{ width: "100%" }}>
          {/* Butonul de autentificare */}
          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "42px",
              marginTop: "10px",
            }}
          >
            {loading ? "Se încarcă..." : "Autentificare"}
          </button>

          {/* Linia cu SAU - plasată între butoane */}
          <div
            style={{
              margin: "20px 0",
              fontSize: "0.8rem",
              color: "#999",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <span
              style={{ height: "1px", width: "40%", background: "#ddd" }}
            ></span>
            SAU
            <span
              style={{ height: "1px", width: "40%", background: "#ddd" }}
            ></span>
          </div>

          {/* Butonul Google */}
          <div
            style={{
              width: "100%",
              height: "42px",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log("Login Failed");
                alert("Nu s-a putut conecta la Google.");
              }}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
              width="300"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
