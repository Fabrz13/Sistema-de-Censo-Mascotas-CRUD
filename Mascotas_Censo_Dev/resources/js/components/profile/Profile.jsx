import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

// 🎨 Color principal (marca)
const PRIMARY_COLOR = '#1EC7A6';
const PRIMARY_SOFT = 'rgba(30,199,166,0.14)';
const PRIMARY_SOFT_2 = 'rgba(30,199,166,0.08)';

function Profile() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    photo: null,
    location: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        phone: currentUser.phone || '',
        photo: null,
        location: currentUser.location ? JSON.stringify(currentUser.location) : ''
      });
    }
  }, [currentUser]);

  const statusBadgeClass = useMemo(() => {
    return currentUser?.status === 'HABILITADO' ? 'bg-success' : 'bg-danger';
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, photo: f }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('_method', 'PUT');
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('address', formData.address);
      fd.append('phone', formData.phone);

      if (formData.location) fd.append('location', formData.location);
      if (formData.photo instanceof File) fd.append('photo', formData.photo);

      const response = await api.updateProfile(fd);

      // tu backend puede devolver { user: {...} } o el user directo
      const updated = response.data?.user || response.data;
      if (setCurrentUser) setCurrentUser(updated);

      setEditMode(false);
    } catch (error) {
      console.error('Error completo:', error);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        let msg = 'Errores de validación:\n\n';
        for (const field in errors) {
          msg += `• ${field}: ${errors[field].join(', ')}\n`;
        }
        alert(msg);
      } else {
        alert('Error al actualizar el perfil. Por favor intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisableAccount = async () => {
    if (!window.confirm('¿Estás seguro de deshabilitar tu cuenta? Esta acción no se puede deshacer y perderás acceso al sistema.')) return;

    try {
      await api.disableAccount();
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Error disabling account:', error);
      alert('Error al deshabilitar la cuenta');
    }
  };

  if (!currentUser) return <div className="text-center py-5">Cargando perfil...</div>;

  const photoUrl = currentUser?.photo_path ? `/storage/${currentUser.photo_path}` : '/storage/user.png';

  return (
    <div
      className="container-fluid py-4"
      style={{ background: `linear-gradient(180deg, ${PRIMARY_SOFT_2}, #ffffff)` }}
    >
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div>
            <h2 className="mb-1" style={{ color: '#0f172a' }}>Mi Perfil</h2>
            <div className="text-muted">Administra tu información personal y tu foto</div>
          </div>

          {!editMode ? (
            <div className="d-flex gap-2">
              <button
                className="btn text-white"
                style={{ backgroundColor: PRIMARY_COLOR }}
                onClick={() => setEditMode(true)}
              >
                <i className="bi bi-pencil-square me-2"></i>
                Editar
              </button>
              <button className="btn btn-outline-danger" onClick={handleDisableAccount}>
                <i className="bi bi-slash-circle me-2"></i>
                Deshabilitar cuenta
              </button>
            </div>
          ) : (
            <button
              className="btn btn-outline-secondary"
              onClick={() => setEditMode(false)}
              disabled={loading}
            >
              <i className="bi bi-x-lg me-2"></i>
              Cancelar
            </button>
          )}
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          {/* Card header */}
          <div
            className="px-4 py-3"
            style={{
              background: `linear-gradient(90deg, ${PRIMARY_COLOR}, #17b89a)`,
              color: 'white'
            }}
          >
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.18)' }}
                >
                  <i className="bi bi-person-badge fs-5"></i>
                </div>
                <div className="lh-1">
                  <div className="fw-bold" style={{ fontSize: '1.05rem' }}>Perfil de Usuario</div>
                  <small style={{ opacity: 0.9 }}>Datos del propietario / usuario</small>
                </div>
              </div>

              <span className={`badge ${statusBadgeClass}`} style={{ fontSize: '0.85rem' }}>
                {currentUser.status}
              </span>
            </div>
          </div>

          <div className="card-body p-4 p-md-4">
            {!editMode ? (
              // ✅ Vista bonita (modo lectura)
              <div className="row g-4 align-items-start">
                <div className="col-12 col-lg-4">
                  <div className="d-flex flex-column align-items-center text-center">
                    <img
                      src={photoUrl}
                      alt="Foto de perfil"
                      className="rounded-circle shadow-sm"
                      style={{ width: 140, height: 140, objectFit: 'cover', border: `4px solid ${PRIMARY_SOFT}` }}
                      onError={(e) => { e.currentTarget.src = '/storage/user.png'; }}
                    />
                    <div className="mt-3">
                      <div className="fw-bold" style={{ fontSize: '1.05rem' }}>{currentUser.name}</div>
                      <div className="text-muted small">{currentUser.email}</div>
                    </div>

                    <div
                      className="mt-3 px-3 py-2 rounded-3"
                      style={{ background: PRIMARY_SOFT_2, width: '100%' }}
                    >
                      <div className="d-flex justify-content-between small">
                        <span className="text-muted">Rol</span>
                        <span className="fw-semibold text-capitalize">{currentUser.role}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-8">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h5 className="mb-0">Información Personal</h5>
                  </div>
                  <hr className="mt-2" />

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="p-3 rounded-3 border bg-white">
                        <div className="text-muted small mb-1">Teléfono</div>
                        <div className="fw-semibold">{currentUser.phone || '-'}</div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="p-3 rounded-3 border bg-white">
                        <div className="text-muted small mb-1">Dirección</div>
                        <div className="fw-semibold">{currentUser.address || '-'}</div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="p-3 rounded-3 border bg-white">
                        <div className="text-muted small mb-1">Ubicación</div>
                        <div className="fw-semibold" style={{ wordBreak: 'break-word' }}>
                          {currentUser.location ? JSON.stringify(currentUser.location) : '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 small text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Tip: mantén tus datos actualizados para mejorar la gestión del sistema.
                  </div>
                </div>
              </div>
            ) : (
              // ✅ Edición (2 columnas en desktop)
              <form onSubmit={handleSubmit}>
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

                  {/* Email */}
                  <div className="col-12 col-md-6">
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

                  {/* Dirección */}
                  <div className="col-12 col-md-6">
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

                  {/* Ubicación */}
                  <div className="col-12">
                    <label className="form-label">Ubicación (JSON)</label>
                    <textarea
                      className="form-control"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      rows={3}
                      placeholder='Ej: {"lat":-2.1,"lng":-79.9}'
                    />
                    <div className="text-muted small mt-1">
                      Si no usas ubicación, puedes dejarlo vacío.
                    </div>
                  </div>

                  {/* Foto */}
                  <div className="col-12">
                    <label className="form-label">Foto de perfil</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                      accept="image/*"
                    />

                    <div className="d-flex align-items-center gap-3 mt-3 flex-wrap">
                      <img
                        src={photoUrl}
                        alt="Foto actual"
                        className="rounded-3 border"
                        style={{ width: 96, height: 96, objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = '/storage/user.png'; }}
                      />
                      <div className="small text-muted">
                        <div className="fw-semibold">Foto actual</div>
                        <div>Sube una nueva imagen para actualizarla.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditMode(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn text-white"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="d-inline-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Guardando...
                      </span>
                    ) : (
                      <span className="d-inline-flex align-items-center gap-2">
                        <i className="bi bi-check2-circle"></i>
                        Guardar cambios
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="text-center text-muted small mt-3">
          © {new Date().getFullYear()} Vet Lomas • Lo mejor para tu mascota
        </div>
      </div>
    </div>
  );
}

export default Profile;
