import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import Swal from 'sweetalert2';
import '../utils/PaymentCalc.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (login(email.trim(), password)) {
      navigate(from, { replace: true });
    } else {
      Swal.fire('Error', 'Credenciales incorrectas.', 'error');
    }
  };

  return (
    <div className="calculator-container login-page">
      <div className="login-card">
        <h2>Iniciar sesión</h2>
        <p>Solo admin puede acceder a la edición.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
