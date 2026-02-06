import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';

const logoSrc = 'pet-health.png';

// 🎨 COLORES DE MARCA
const PRIMARY_COLOR = '#1EC7A6';
const PRIMARY_SOFT = 'rgba(30,199,166,0.15)';
const PRIMARY_SOFT_2 = 'rgba(30,199,166,0.08)';

function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { loginWithToken } = useAuth();

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const canSubmit = useMemo(() => {
    return credentials.email.trim() !== '' && credentials.password.trim() !== '' && !isSubmitting;
  }, [credentials, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.login(credentials);
      await loginWithToken(response.data.token);
    } catch {
      setError('Credenciales incorrectas');
      setIsSubmitting(false);
    }
  };

  return (
    <div
    className="vh-100 overflow-hidden"
    style={{
        background: `linear-gradient(180deg, ${PRIMARY_SOFT}, #ffffff)`,
        position: 'relative'
    }}
    >
        <div
            style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: 980,
            padding: '0 12px'
            }}
        >
            <div className="w-100" style={{ maxWidth: 980 }}>
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="row g-0">

                    {/* 🟢 LADO IZQUIERDO */}
                    <div
                    className="col-12 col-lg-5 d-flex flex-column justify-content-center align-items-center text-center p-4 p-md-5 text-white"
                    style={{
                        background: `linear-gradient(180deg, ${PRIMARY_COLOR}, #17b89a)`
                    }}
                    >
                    <img
                        src={logoSrc}
                        alt="Logo Censo Mascotas"
                        style={{ width: 140, height: 'auto' }}
                    />

                    <h1 className="h4 mt-3 mb-2 fw-bold">Vet Lomas</h1>
                    <p className="mb-0 opacity-90" style={{ maxWidth: 260 }}>
                        Lo mejor para tu mascota
                    </p>

                    <div className="mt-4 d-none d-lg-block small opacity-75" style={{ maxWidth: 300 }}>
                        Gestión veterinaria simple, segura y moderna.
                    </div>
                    </div>

                    {/* ⚪ LADO DERECHO */}
                    <div className="col-12 col-lg-7 bg-white">
                    <div className="card-body p-4 p-md-5">

                        {/* Header */}
                        <div className="mb-4">
                        <div className="d-flex align-items-center gap-3">
                            <div
                            className="d-inline-flex align-items-center justify-content-center rounded-circle"
                            style={{
                                width: 44,
                                height: 44,
                                background: PRIMARY_SOFT,
                                color: PRIMARY_COLOR
                            }}
                            >
                            <i className="bi bi-shield-lock fs-5"></i>
                            </div>
                            <div>
                            <h2 className="h5 mb-0">Iniciar Sesión</h2>
                            <div className="text-muted small">
                                Ingresa con tus credenciales
                            </div>
                            </div>
                        </div>
                        </div>

                        {error && (
                        <div className="alert alert-danger d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                        )}

                        <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <div className="input-group">
                            <span className="input-group-text bg-white">
                                <i className="bi bi-envelope"></i>
                            </span>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                placeholder="correo@ejemplo.com"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                            />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-2">
                            <label className="form-label">Contraseña</label>
                            <div className="input-group">
                            <span className="input-group-text bg-white">
                                <i className="bi bi-lock"></i>
                            </span>

                            <input
                                type={showPass ? 'text' : 'password'}
                                className="form-control"
                                name="password"
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPass(!showPass)}
                            >
                                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mb-4">
                            <button type="button" className="btn btn-link p-0 small">
                            ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {/* Botón */}
                        <button
                            type="submit"
                            className="btn w-100 py-2 text-white"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                            disabled={!canSubmit}
                        >
                            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
                        </button>

                        <div className="text-center mt-3">
                            <span className="text-muted">¿No tienes cuenta? </span>
                            <Link to="/register" className="fw-semibold" style={{ color: PRIMARY_COLOR }}>
                            Crear una cuenta
                            </Link>
                        </div>
                        </form>

                        <div className="mt-4 pt-3 border-top d-flex justify-content-between small text-muted">
                        <span>© {new Date().getFullYear()} CBPARTNERS</span>
                        <span className="d-none d-sm-inline">Soporte: Admin</span>
                        </div>

                    </div>
                    </div>

                </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Login;
