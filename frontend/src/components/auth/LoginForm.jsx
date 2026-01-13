import { useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import api from "../../services/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import { GoogleLogin } from "@react-oauth/google";

const LoginForm = ({ showPassword, togglePassword, setIsSignUp, navigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Stare pentru a comuta între Login și Forgot Password
  const [view, setView] = useState("login"); // "login" sau "forgot"

  // --- LOGIN CLASIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/token/", { email, password });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      navigate("/");
    } catch (error) {
      alert("Email sau parolă incorectă!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Endpoint-ul de backend pentru trimitere mail resetare
      await api.post("/api/users/password-reset/", { email });
      alert("Un link de resetare a fost trimis pe adresa de email!");
      setView("login"); // Ne întoarcem la login după succes
    } catch {
      alert("Eroare! Verifică dacă adresa de email este corectă.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await api.post("/api/users/google/", {
        token: credentialResponse.credential,
      });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Autentificarea cu Google a eșuat.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER FORGOT PASSWORD VIEW ---
  if (view === "forgot") {
    return (
      <div className="form-container sign-in-container">
        <form onSubmit={handleForgotPassword}>
          <h1>Resetare Parolă</h1>
          <p
            style={{
              textAlign: "center",
              margin: "10px 0",
              color: "#666",
              fontSize: "0.9rem",
            }}
          >
            Introdu adresa de e-mail și îți vom trimite un link pentru a-ți
            reseta parola.
          </p>

          <div className="input-group">
            <label>E-mail</label>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="email@exemplu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaEnvelope className="icon" />
            </div>
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: "20px" }}
          >
            {loading ? "Se trimite..." : "Trimite Link Resetare"}
          </button>

          <p className="switch-text" style={{ marginTop: "20px" }}>
            <span
              onClick={() => setView("login")}
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <FaArrowLeft size={12} /> Înapoi la Autentificare
            </span>
          </p>
        </form>
      </div>
    );
  }

  // --- RENDER LOGIN VIEW (Codul tău original) ---
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

        {/* Modificat aici pentru a schimba view-ul */}
        <span
          className="forgot-password"
          onClick={() => setView("forgot")}
          style={{ cursor: "pointer" }}
        >
          Ați uitat parola?
        </span>

        <div style={{ width: "100%" }}>
          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%", height: "42px", marginTop: "10px" }}
          >
            {loading ? "Se încarcă..." : "Autentificare"}
          </button>

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

          <div
            style={{
              width: "100%",
              height: "42px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "6px",
            }}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Nu s-a putut conecta la Google.")}
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
