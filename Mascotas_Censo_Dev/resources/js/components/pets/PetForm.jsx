import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const PRIMARY_COLOR = '#1EC7A6';
const PRIMARY_SOFT = 'rgba(30,199,166,0.14)';

function PetForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser } = useAuth();
  const isVeterinario = currentUser?.role === 'veterinario';

  const isEditMode = useMemo(() => location.pathname.includes('/edit'), [location.pathname]);
  const isViewMode = useMemo(() => {
    // /pets/:id (sin /edit) => view
    return Boolean(id) && !isEditMode && location.pathname.startsWith('/pets/');
  }, [id, isEditMode, location.pathname]);

  const isCreateMode = !id;

  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    species: 'perro',
    breed: '',
    size: 'mediano',
    age: '',
    vaccinated: false,
    food_type: '',
    last_vaccination: '',
    photo: null,
    owner_id: '',
    status: 'HABILITADO'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentOwner = await api.getCurrentOwner();

        if (id) {
          const petResponse = await api.getPet(id);
          const pet = petResponse.data;

          setFormData({
            ...pet,
            last_vaccination: pet.last_vaccination?.split('T')[0] || '',
            owner_id: currentOwner.data.id,
            photo: null
          });

          if (pet.photo_path) {
            setPreviewUrl(`/storage/${pet.photo_path}`);
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            owner_id: currentOwner.data.id
          }));
          setPreviewUrl('');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      // limpiar URL temporal si existía
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const readOnlyFields = isViewMode || isVeterinario;

  const title = readOnlyFields
    ? 'Detalles de Mascota'
    : isEditMode
      ? 'Editar Mascota'
      : 'Registrar Nueva Mascota';

  const subtitle = readOnlyFields
    ? 'Consulta la información del paciente'
    : isEditMode
      ? 'Actualiza la información de la mascota'
      : 'Registra una nueva mascota en el sistema';

  const handleChange = (e) => {
    if (readOnlyFields) return;

    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (readOnlyFields) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, photo: file }));

    // preview
    const url = URL.createObjectURL(file);
    setPreviewUrl((prevUrl) => {
      if (prevUrl?.startsWith('blob:')) URL.revokeObjectURL(prevUrl);
      return url;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnlyFields) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('species', formData.species);
      formDataToSend.append('breed', formData.breed);
      formDataToSend.append('size', formData.size);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('vaccinated', formData.vaccinated ? '1' : '0');
      formDataToSend.append('food_type', formData.food_type);
      formDataToSend.append('last_vaccination', formData.last_vaccination || '');

      if (formData.photo instanceof File) {
        formDataToSend.append('photo', formData.photo);
      }

      if (id) {
        formDataToSend.append('_method', 'PUT');
        await api.updatePet(id, formDataToSend);
      } else {
        await api.createPet(formDataToSend);
      }

      navigate('/');
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('Error al guardar: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (readOnlyFields) return;

    if (!window.confirm('¿Estás seguro de deshabilitar esta mascota?')) return;

    try {
      setLoading(true);
      await api.deletePet(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('Error al deshabilitar la mascota');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5">Cargando formulario...</div>;

  return (
    <div className="page-container">
      {/* Header superior */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="mb-1">{title}</h1>
          <div className="text-muted">{subtitle}</div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            <i className="bi bi-arrow-left me-2"></i>Volver
          </button>

          {!readOnlyFields && (
            <button
              form="pet-form"
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
        {/* Header del card */}
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
            <i className="bi bi-heart-pulse fs-5"></i>
          </div>

          <div className="lh-1">
            <div className="fw-semibold">Ficha de mascota</div>
            <small className="text-muted">
              {readOnlyFields ? 'Modo lectura' : isEditMode ? 'Edición' : 'Creación'}
            </small>
          </div>

          {/* Badge vacunado */}
          {id && (
            <div className="ms-auto d-flex align-items-center gap-2">
              <span className={`badge ${formData.vaccinated ? 'bg-success' : 'bg-danger'}`}>
                {formData.vaccinated ? 'Vacunado' : 'No vacunado'}
              </span>
            </div>
          )}
        </div>

        <div className="card-body p-4 p-md-5">
          <form id="pet-form" onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Nombre */}
              <div className="col-12 col-md-6">
                <label className="form-label">Nombre</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-tag"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    readOnly={readOnlyFields}
                    required
                    placeholder="Ej: Rocky"
                  />
                </div>
              </div>

              {/* Especie */}
              <div className="col-12 col-md-6">
                <label className="form-label">Especie</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-stars"></i>
                  </span>
                  <select
                    className="form-select"
                    name="species"
                    value={formData.species || 'perro'}
                    onChange={handleChange}
                    disabled={readOnlyFields}
                    required
                  >
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Raza */}
              <div className="col-12 col-md-6">
                <label className="form-label">Raza</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-award"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    name="breed"
                    value={formData.breed || ''}
                    onChange={handleChange}
                    readOnly={readOnlyFields}
                    required
                    placeholder="Ej: Pitbull / Mestizo"
                  />
                </div>
              </div>

              {/* Tamaño */}
              <div className="col-12 col-md-6">
                <label className="form-label">Tamaño</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-arrows-angle-expand"></i>
                  </span>
                  <select
                    className="form-select"
                    name="size"
                    value={formData.size || 'mediano'}
                    onChange={handleChange}
                    disabled={readOnlyFields}
                    required
                  >
                    <option value="pequeño">Pequeño</option>
                    <option value="mediano">Mediano</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>
              </div>

              {/* Edad */}
              <div className="col-12 col-md-6">
                <label className="form-label">Edad (años)</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-hourglass-split"></i>
                  </span>
                  <input
                    type="number"
                    className="form-control"
                    name="age"
                    value={formData.age ?? ''}
                    onChange={handleChange}
                    min="0"
                    readOnly={readOnlyFields}
                    required
                    placeholder="Ej: 3"
                  />
                </div>
              </div>

              {/* Alimentación */}
              <div className="col-12 col-md-6">
                <label className="form-label">Tipo de alimentación</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-cup-hot"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    name="food_type"
                    value={formData.food_type || ''}
                    onChange={handleChange}
                    readOnly={readOnlyFields}
                    required
                    placeholder="Ej: Croquetas / Dieta mixta"
                  />
                </div>
              </div>

              {/* Última vacunación */}
              <div className="col-12 col-md-6">
                <label className="form-label">Última vacunación</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-calendar-event"></i>
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    name="last_vaccination"
                    value={formData.last_vaccination || ''}
                    onChange={handleChange}
                    readOnly={readOnlyFields}
                  />
                </div>
                <div className="form-text">Opcional si no aplica.</div>
              </div>

              {/* Vacunado */}
              <div className="col-12 col-md-6 d-flex align-items-end">
                <div className="form-check mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="vaccinated"
                    name="vaccinated"
                    checked={!!formData.vaccinated}
                    onChange={handleChange}
                    disabled={readOnlyFields}
                  />
                  <label className="form-check-label" htmlFor="vaccinated">
                    Vacunado
                  </label>
                </div>
              </div>

              {/* Foto */}
              <div className="col-12">
                <label className="form-label">Foto de la mascota</label>

                {!readOnlyFields && (
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                )}

                <div className="mt-3 d-flex align-items-center gap-3 flex-wrap">
                  <div
                    className="border rounded-3 overflow-hidden bg-white"
                    style={{ width: 110, height: 110 }}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                        <i className="bi bi-image fs-2"></i>
                      </div>
                    )}
                  </div>

                  <div className="text-muted small">
                    <div className="fw-semibold text-dark">Recomendación</div>
                    Usa una imagen cuadrada (1:1) para mejor resultado.
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones inferiores */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4 pt-3 border-top">
              <div className="text-muted small">
                {readOnlyFields
                  ? 'Vista de solo lectura.'
                  : 'Asegúrate de completar los campos obligatorios antes de guardar.'}
              </div>

              <div className="d-flex gap-2">
                {!readOnlyFields && id && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Deshabilitar
                  </button>
                )}

                {!readOnlyFields && (
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

            {/* Aviso especial para veterinario */}
            {isVeterinario && (
              <div className="alert alert-info mt-4 mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Estás en modo <strong>Veterinario</strong>, por eso esta ficha está en solo lectura.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default PetForm;
