import { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../services/api";

const RegisterForm = ({ showPassword, togglePassword, setIsSignUp }) => {
  // State-uri pentru câmpuri
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State-uri pentru UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); 

    // Validare frontend (pentru confirmare)
    if (password !== confirmPassword) {
      setErrors({ password2: ["Parolele nu se potrivesc."] });
      setLoading(false);
      return;
    }

    try {
      await api.post("/api/users/register/", {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        password2: confirmPassword
      });

      alert("Cont creat cu succes! Te rugăm să te loghezi.");
      setIsSignUp(false);
      
    } catch (error) {
      console.error("Register error:", error);
      
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        alert("Eroare de conexiune. Verifică serverul.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) => {
    if (errors[field]) {
      return (
        <div style={{ color: "#ff4b2b", fontSize: "0.75rem", marginTop: "5px", textAlign: "left", width: "100%" }}>
          {errors[field].map((err, index) => (
            <span key={index} style={{ display: "block" }}>• {err}</span>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleSubmit}>
        <h1>Înregistrează-te</h1>

        <p className="switch-text">
          Ai deja cont?
          <span onClick={() => setIsSignUp(false)}>Autentifică-te</span>
        </p>

        <div className="row">
          <div className="input-group">
            <label>Nume</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder="Nume" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={errors.last_name ? { border: "1px solid #ff4b2b" } : {}}
              />
            </div>
            {renderError("last_name")}
          </div>
          
          <div className="input-group">
            <label>Prenume</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder="Prenume" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={errors.first_name ? { border: "1px solid #ff4b2b" } : {}}
              />
            </div>
            {renderError("first_name")}
          </div>
        </div>

        <div className="input-group">
          <label>E-mail</label>
          <div className="input-wrapper">
            <input 
              type="email" 
              placeholder="Ex: student@usv.ro" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={errors.email ? { border: "1px solid #ff4b2b" } : {}}
            />
            <FaEnvelope className="icon" />
          </div>
          {renderError("email")}
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
              style={errors.password ? { border: "1px solid #ff4b2b" } : {}}
            />
            <div className="icon" onClick={togglePassword}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
          {renderError("password")}
        </div>

        <div className="input-group">
          <label>Confirmă parola</label>
          <div className="input-wrapper">
            <input 
              type="password" 
              placeholder="Confirmă parola" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={errors.password2 ? { border: "1px solid #ff4b2b" } : {}}
            />
            <FaLock className="icon" />
          </div>
          {renderError("password2")}
        </div>

        {renderError("non_field_errors")}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Se procesează..." : "Creează cont"}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;