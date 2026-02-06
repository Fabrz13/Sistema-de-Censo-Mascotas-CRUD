import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const PRIMARY_COLOR = '#1EC7A6';
const PRIMARY_SOFT = 'rgba(30,199,166,0.14)';

export default function UserForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, loading: authLoading, token } = useAuth();
  const isSuperadmin = currentUser?.role === 'superadmin';

  const isEditMode = useMemo(() => location.pathname.includes('/edit'), [location.pathname]);
  const isViewMode = useMemo(() => {
    return Boolean(id) && !isEditMode && location.pathname.startsWith('/users/');
  }, [id, isEditMode, location.pathname]);

  const isCreateMode = !id;
  const readOnly = isViewMode;

  const [loading, setLoading] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'cliente',
    status: 'HABILITADO',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    // Esperar auth primero
    if (authLoading) return;

    // Si no hay token, no debería estar aquí (opcional)
    if (!token) return;

    // UX: si no es superadmin, sacarlo
    if (!isSuperadmin && currentUser) {
      navigate('/');
      return;
    }

    const load = async () => {
      try {
        if (id) {
          const res = await api.getUser(id);
          const u = res.data;

          setFormData((prev) => ({
            ...prev,
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            address: u.address || '',
            role: u.role || 'cliente',
            status: u.status || 'HABILITADO',
            password: '',
            password_confirmation: '',
          }));
        }
      } catch (e) {
        console.error(e);
        alert(e?.response?.data?.message || 'No se pudo cargar el usuario');
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isSuperadmin, currentUser, navigate, authLoading, token]);

  const title = readOnly
    ? 'Detalles de Usuario'
    : isEditMode
      ? 'Editar Usuario'
      : 'Crear Usuario';

  const subtitle = readOnly
    ? 'Consulta la información del usuario'
    : isEditMode
      ? 'Actualiza datos y permisos del usuario'
      : 'Registra un nuevo usuario en el sistema';

  const handleChange = (e) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateBeforeSubmit = () => {
    if (!formData.name.trim()) return 'El nombre es obligatorio';
    if (!formData.email.trim()) return 'El correo es obligatorio';
    if (!formData.phone.trim()) return 'El teléfono es obligatorio';
    if (!formData.address.trim()) return 'La dirección es obligatoria';
    if (!formData.role) return 'El rol es obligatorio';

    if (isCreateMode) {
      if (!formData.password) return 'La contraseña es obligatoria';
      if (formData.password.length < 6) return 'La contraseña debe tener mínimo 6 caracteres';
      if (formData.password !== formData.password_confirmation) return 'Las contraseñas no coinciden';
    }

    if (!isCreateMode && formData.password) {
      if (formData.password.length < 6) return 'La contraseña debe tener mínimo 6 caracteres';
      if (formData.password !== formData.password_confirmation) return 'Las contraseñas no coinciden';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;

    const error = validateBeforeSubmit();
    if (error) return alert(error);

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: formData.role,
        status: formData.status,
      };

      if (isCreateMode) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
        await api.createUser(payload);
      } else {
        if (formData.password) {
          payload.password = formData.password;
          payload.password_confirmation = formData.password_confirmation;
        }
        await api.updateUser(id, payload);
      }

      navigate('/users');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Error al guardar usuario');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || readOnly) return;
    if (!window.confirm('¿Seguro que deseas deshabilitar este usuario?')) return;

    try {
      setLoading(true);
      await api.deleteUser(id);
      navigate('/users');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'No se pudo deshabilitar el usuario');
      setLoading(false);
    }
  };

  // 🧠 Estados de sesión
  if (authLoading) return <div className="text-center py-5">Cargando sesión...</div>;
  if (!token) return <div className="text-center py-5">Redirigiendo...</div>;

  if (!isSuperadmin && currentUser) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">No autorizado.</div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-5">Cargando...</div>;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="mb-1">{title}</h1>
          <div className="text-muted">{subtitle}</div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/users')}
            disabled={loading}
          >
            <i className="bi bi-arrow-left me-2"></i>Volver
          </button>

          {!readOnly && (
            <button
              form="user-form"
              type="submit"
              className="btn text-white"
              style={{ backgroundColor: PRIMARY_COLOR }}
              disabled={loading}
            >
              <i className="bi bi-check2-circle me-2"></i>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* Card header */}
        <div
          className="px-4 py-3 d-flex align-items-center gap-3"
          style={{
            background: `linear-gradient(90deg, ${PRIMARY_SOFT}, rgba(255,255,255,1))`,
            borderBottom: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 44,
              height: 44,
              background: 'rgba(30,199,166,0.18)',
              color: PRIMARY_COLOR
            }}
          >
            <i className="bi bi-person-gear fs-5"></i>
          </div>

          <div className="lh-1">
            <div className="fw-semibold">Información del usuario</div>
            <small className="text-muted">
              {readOnly ? 'Modo lectura' : isEditMode ? 'Edición' : 'Creación'}
            </small>
          </div>

          {id && (
            <div className="ms-auto">
              <span className={`badge ${formData.status === 'HABILITADO' ? 'bg-success' : 'bg-danger'}`}>
                {formData.status}
              </span>
            </div>
          )}
        </div>

        <div className="card-body p-4 p-md-5">
          <form id="user-form" onSubmit={handleSubmit}>
            {/* Datos principales */}
            <div className="row g-3">
              {/* Nombre */}
              <div className="col-12 col-md-6">
                <label className="form-label">Nombre</label>
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
                    readOnly={readOnly}
                    required
                    placeholder="Nombre completo"
                  />
                </div>
              </div>

              {/* Correo */}
              <div className="col-12 col-md-6">
                <label className="form-label">Correo</label>
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
                    readOnly={readOnly}
                    required
                    placeholder="correo@ejemplo.com"
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
                    readOnly={readOnly}
                    required
                    placeholder="0999999999"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="col-12 col-md-6">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={readOnly}
                  required
                >
                  <option value="HABILITADO">HABILITADO</option>
                  <option value="DESHABILITADO">DESHABILITADO</option>
                </select>
              </div>

              {/* Dirección */}
              <div className="col-12">
                <label className="form-label">Dirección</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-geo-alt"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    readOnly={readOnly}
                    required
                    placeholder="Dirección"
                  />
                </div>
              </div>

              {/* Rol */}
              <div className="col-12 col-md-6">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={readOnly}
                  required
                >
                  <option value="cliente">cliente</option>
                  <option value="veterinario">veterinario</option>
                  <option value="superadmin">superadmin</option>
                </select>

                <div className="form-text">
                  Define los permisos del usuario dentro del sistema.
                </div>
              </div>

              {/* Bloque password solo si NO es view */}
              {!readOnly && (
                <>
                  <div className="col-12 col-md-6">
                    <label className="form-label">
                      {isCreateMode ? 'Contraseña' : 'Nueva contraseña (opcional)'}
                    </label>

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
                        placeholder={isCreateMode ? 'Obligatorio' : 'Dejar vacío si no deseas cambiarla'}
                        required={isCreateMode}
                      />

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPass((v) => !v)}
                        title={showPass ? 'Ocultar' : 'Mostrar'}
                        aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                      >
                        <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>

                    <div className="form-text">
                      Mínimo 6 caracteres.
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Confirmar contraseña</label>

                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-shield-lock"></i>
                      </span>

                      <input
                        type={showPass2 ? 'text' : 'password'}
                        className="form-control"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        placeholder={isCreateMode ? 'Obligatorio' : 'Solo si cambias la contraseña'}
                        required={isCreateMode}
                      />

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPass2((v) => !v)}
                        title={showPass2 ? 'Ocultar' : 'Mostrar'}
                        aria-label={showPass2 ? 'Ocultar' : 'Mostrar'}
                      >
                        <i className={`bi ${showPass2 ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Acciones inferiores */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4 pt-3 border-top">
              <div className="text-muted small">
                {readOnly ? 'Vista de solo lectura.' : 'Revisa los datos antes de guardar.'}
              </div>

              <div className="d-flex gap-2">
                {!readOnly && id && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <i className="bi bi-person-x me-2"></i>
                    Deshabilitar
                  </button>
                )}

                {!readOnly && (
                  <button
                    type="submit"
                    className="btn text-white"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                    disabled={loading}
                  >
                    <i className="bi bi-check2-circle me-2"></i>
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                )}
              </div>
            </div>

            {/* Hint extra en view */}
            {readOnly && id && (
              <div className="alert alert-info mt-4 mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Para editar este usuario, entra en modo edición:{' '}
                <Link to={`/users/${id}/edit`} className="fw-semibold" style={{ color: PRIMARY_COLOR }}>
                  Editar usuario
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
