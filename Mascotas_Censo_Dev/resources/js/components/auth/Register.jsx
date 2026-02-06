import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';

const logoSrc = 'pet-health.png';

// 🎨 COLORES DE MARCA
const PRIMARY_COLOR = '#1EC7A6';
const PRIMARY_SOFT = 'rgba(30,199,166,0.15)';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    address: '',
    phone: ''
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const passwordsMatch = useMemo(() => {
    if (!formData.password || !formData.password_confirmation) return true;
    return formData.password === formData.password_confirmation;
  }, [formData.password, formData.password_confirmation]);

  const canSubmit = useMemo(() => {
    const required =
      formData.name.trim() &&
      formData.email.trim() &&
      formData.password.trim() &&
      formData.password_confirmation.trim() &&
      formData.address.trim() &&
      formData.phone.trim();

    return Boolean(required) && passwordsMatch && !isSubmitting;
  }, [formData, passwordsMatch, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.register(formData);

      // ✅ Mantener coherencia con AuthContext
      if (response?.data?.token) {
        await loginWithToken(response.data.token);
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el registro');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(180deg, ${PRIMARY_SOFT}, #ffffff)`,
        padding: '12px',
        overflow: 'hidden'
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
                Crea tu cuenta para registrar y gestionar tus mascotas.
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
                      <i className="bi bi-person-plus fs-5"></i>
                    </div>
                    <div>
                      <h2 className="h5 mb-0">Crear cuenta</h2>
                      <div className="text-muted small">Registro de Dueño</div>
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
                  {/* ✅ GRID 2 columnas en desktop */}
                  <div className="row g-3">

                    {/* Nombre */}
                    <div className="col-12 col-md-6">
                      <label className="form-label">Nombre completo</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div className="col-12 col-md-6">
                      <label className="form-label">Teléfono</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="bi bi-telephone"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-12 col-md-12">
                      <label className="form-label">Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Contraseña */}
                    <div className="col-12 col-md-6">
                      <label className="form-label">Contraseña</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type={showPass ? 'text' : 'password'}
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPass((v) => !v)}
                        >
                          <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    {/* Confirmación */}
                    <div className="col-12 col-md-6">
                      <label className="form-label">Confirmar contraseña</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="bi bi-shield-lock"></i>
                        </span>
                        <input
                          type={showPass2 ? 'text' : 'password'}
                          className={`form-control ${passwordsMatch ? '' : 'is-invalid'}`}
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPass2((v) => !v)}
                        >
                          <i className={`bi ${showPass2 ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                        {!passwordsMatch && (
                          <div className="invalid-feedback">
                            Las contraseñas no coinciden
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botón */}
                    <div className="col-12 mt-2">
                      <button
                        type="submit"
                        className="btn w-100 py-2 text-white"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                        disabled={!canSubmit}
                      >
                        {isSubmitting ? (
                          <span className="d-inline-flex align-items-center gap-2">
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Registrando...
                          </span>
                        ) : (
                          'Registrarse'
                        )}
                      </button>

                      <div className="text-center mt-3">
                        <span className="text-muted">¿Ya tienes cuenta? </span>
                        <Link to="/login" className="fw-semibold" style={{ color: PRIMARY_COLOR }}>
                          Iniciar sesión
                        </Link>
                      </div>
                    </div>
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
  );
}

export default Register;
