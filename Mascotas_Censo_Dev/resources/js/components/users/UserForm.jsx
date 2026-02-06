import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';

export default function UserForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser } = useAuth();
  const isSuperadmin = currentUser?.role === 'superadmin';

  // Modo view/edit (igual que PetForm)
  const isEditMode = useMemo(() => location.pathname.includes('/edit'), [location.pathname]);
  const isViewMode = useMemo(() => {
    // /users/:id (sin /edit) es view
    return Boolean(id) && !isEditMode && location.pathname.startsWith('/users/');
  }, [id, isEditMode, location.pathname]);

  const isCreateMode = !id;

  const [loading, setLoading] = useState(true);

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
    // UX: si no es superadmin, no permitir entrar
    if (!isSuperadmin && currentUser) {
      navigate('/');
      return;
    }

    const load = async () => {
      try {
        if (id) {
          const res = await api.getUser(id);
          const u = res.data;

          setFormData(prev => ({
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
  }, [id, isSuperadmin, currentUser, navigate]);

  const readOnly = isViewMode;

  const handleChange = (e) => {
    if (readOnly) return;

    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateBeforeSubmit = () => {
    if (!formData.name.trim()) return 'El nombre es obligatorio';
    if (!formData.email.trim()) return 'El correo es obligatorio';
    if (!formData.phone.trim()) return 'El teléfono es obligatorio';
    if (!formData.address.trim()) return 'La dirección es obligatoria';
    if (!formData.role) return 'El rol es obligatorio';

    // Crear: password requerido
    if (isCreateMode) {
      if (!formData.password) return 'La contraseña es obligatoria';
      if (formData.password.length < 6) return 'La contraseña debe tener mínimo 6 caracteres';
      if (formData.password !== formData.password_confirmation) return 'Las contraseñas no coinciden';
    }

    // Editar: password opcional, pero si se pone, debe coincidir
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
    if (error) {
      alert(error);
      return;
    }

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

      // Crear: password requerido
      if (isCreateMode) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
        await api.createUser(payload);
      } else {
        // Editar: password opcional
        if (formData.password) {
          payload.password = formData.password;
          payload.password_confirmation = formData.password_confirmation;
        }
        await api.updateUser(id, payload);
      }

      navigate('/users');

    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Error al guardar usuario';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (readOnly) return;

    if (!window.confirm('¿Seguro que deseas deshabilitar este usuario?')) return;

    try {
      setLoading(true);
      await api.deleteUser(id);
      navigate('/users');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'No se pudo deshabilitar el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperadmin && currentUser) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">No autorizado.</div>
      </div>
    );
  }

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  const title = readOnly
    ? 'Detalles de Usuario'
    : isEditMode
      ? 'Editar Usuario'
      : 'Crear Usuario';

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">{title}</h3>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label>Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    readOnly={readOnly}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label>Correo</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={readOnly}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Teléfono</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        readOnly={readOnly}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Status</label>
                      <select
                        className="form-control"
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
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label>Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    readOnly={readOnly}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label>Rol</label>
                  <select
                    className="form-control"
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
                </div>

                {/* Password */}
                {!readOnly && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label>{isCreateMode ? 'Contraseña' : 'Nueva contraseña (opcional)'}</label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder={isCreateMode ? 'Obligatorio' : 'Dejar vacío si no deseas cambiarla'}
                          required={isCreateMode}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label>Confirmar contraseña</label>
                        <input
                          type="password"
                          className="form-control"
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          placeholder={isCreateMode ? 'Obligatorio' : 'Solo si cambias la contraseña'}
                          required={isCreateMode}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={() => navigate('/users')}
                  >
                    Volver
                  </button>

                  {!readOnly && (
                    <button
                      type="submit"
                      className="btn btn-primary me-2"
                      disabled={loading}
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                  )}

                  {!readOnly && id && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDelete}
                    >
                      Deshabilitar Usuario
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
