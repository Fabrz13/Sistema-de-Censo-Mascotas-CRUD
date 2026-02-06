import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

const PRIMARY_COLOR = "#1EC7A6";
const PRIMARY_SOFT = "rgba(30,199,166,0.14)";

export default function ScheduleMedicalConsultation() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);

  const [step, setStep] = useState(1);

  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedVetId, setSelectedVetId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");

  // UX extras
  const [petSearch, setPetSearch] = useState("");

  const selectedPet = useMemo(
    () => pets.find((p) => String(p.id) === String(selectedPetId)),
    [pets, selectedPetId]
  );

  const filteredPets = useMemo(() => {
    const q = petSearch.trim().toLowerCase();
    if (!q) return pets;

    return pets.filter((p) => {
      const name = (p?.name || "").toLowerCase();
      const breed = (p?.breed || "").toLowerCase();
      const species = (p?.species || "").toLowerCase();
      return name.includes(q) || breed.includes(q) || species.includes(q);
    });
  }, [pets, petSearch]);

  useEffect(() => {
    const load = async () => {
      try {
        const petsRes = await api.getPets();
        setPets(petsRes.data || []);

        const vetsRes = await api.getVeterinarians();
        setVets(vetsRes.data || []);
      } catch (e) {
        console.error(e);
        alert("No se pudo cargar la información para agendar.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const goStep2 = () => {
    if (!selectedPetId) {
      alert("Selecciona una mascota para continuar.");
      return;
    }
    setStep(2);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!selectedPetId) return alert("Selecciona una mascota.");
    if (!selectedVetId) return alert("Selecciona un veterinario.");
    if (!scheduledAt) return alert("Selecciona fecha y hora.");

    try {
      setLoading(true);

      await api.createMedicalConsultation({
        pet_id: Number(selectedPetId),
        veterinarian_id: Number(selectedVetId),
        scheduled_at: scheduledAt,
        notes: notes || null,
      });

      navigate("/medical-consultations");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Error al crear la consulta médica.");
      setLoading(false);
    }
  };

  const petPhotoSrc = (pet) => {
    if (!pet) return "/storage/pet.png";
    if (pet.photo_path) return `/storage/${pet.photo_path}`;
    return "/storage/pet.png"; // asegúrate de tener un placeholder
  };

  if (loading) return <div className="text-center py-5">Cargando...</div>;

  return (
    <div className="page-container">
      {/* Header superior */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="mb-1">Agendar cita médica</h1>
          <div className="text-muted">
            Selecciona una mascota y completa los datos para crear una nueva cita.
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left me-2"></i>Volver
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* Header del card */}
        <div
          className="px-4 py-3 d-flex align-items-center gap-3"
          style={{
            background: `linear-gradient(90deg, ${PRIMARY_SOFT}, rgba(255,255,255,1))`,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 44,
              height: 44,
              background: "rgba(30,199,166,0.18)",
              color: PRIMARY_COLOR,
            }}
          >
            <i className="bi bi-calendar2-heart fs-5"></i>
          </div>

          <div className="lh-1">
            <div className="fw-semibold">
              {step === 1 ? "Paso 1: Selecciona una mascota" : "Paso 2: Datos de la cita"}
            </div>
            <small className="text-muted">
              {step === 1
                ? "Elige el paciente para agendar."
                : "Selecciona veterinario, fecha/hora y agrega notas si deseas."}
            </small>
          </div>

          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="badge text-bg-light">
              Paso <strong>{step}</strong> de <strong>2</strong>
            </span>
          </div>
        </div>

        <div className="card-body p-4 p-md-5">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              {pets.length === 0 ? (
                <div className="alert alert-warning mb-0">
                  No tienes mascotas registradas (o no tienes acceso a ninguna mascota).
                </div>
              ) : (
                <>
                  {/* buscador */}
                  <div className="mb-3">
                    <label className="form-label">Buscar mascota</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre, especie o raza"
                        value={petSearch}
                        onChange={(e) => setPetSearch(e.target.value)}
                      />
                    </div>
                    <div className="form-text">
                      Mostrando <strong>{filteredPets.length}</strong> mascota(s)
                    </div>
                  </div>

                  {/* cards */}
                  <div className="row g-3">
                    {filteredPets.map((pet) => {
                      const isSelected = String(selectedPetId) === String(pet.id);

                      return (
                        <div key={pet.id} className="col-12 col-md-6 col-lg-4">
                          <button
                            type="button"
                            onClick={() => setSelectedPetId(String(pet.id))}
                            className="btn w-100 text-start p-0 border-0"
                            style={{ background: "transparent" }}
                          >
                            <div
                              className="card h-100 border rounded-4"
                              style={{
                                boxShadow: isSelected ? "0 0 0 3px rgba(30,199,166,0.25)" : "none",
                                borderColor: isSelected ? "rgba(30,199,166,0.55)" : "rgba(0,0,0,0.08)",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <div className="card-body d-flex gap-3">
                                <div
                                  className="rounded-3 overflow-hidden bg-white border"
                                  style={{ width: 64, height: 64 }}
                                >
                                  <img
                                    src={petPhotoSrc(pet)}
                                    alt={pet.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => {
                                      e.currentTarget.src = "/storage/pet.png";
                                    }}
                                  />
                                </div>

                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center justify-content-between gap-2">
                                    <div className="fw-semibold">{pet.name}</div>
                                    {isSelected && (
                                      <span
                                        className="badge"
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                      >
                                        Seleccionada
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-muted small">
                                    {pet.species} • {pet.breed || "Sin raza"} • {pet.size || "—"}
                                  </div>

                                  <div className="mt-2 d-flex gap-2 flex-wrap">
                                    <span className="badge text-bg-light">
                                      ID #{pet.id}
                                    </span>
                                    <span
                                      className={`badge ${
                                        pet.vaccinated ? "bg-success" : "bg-danger"
                                      }`}
                                    >
                                      {pet.vaccinated ? "Vacunado" : "No vacunado"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div
                                className="px-3 pb-3"
                                style={{ marginTop: "-6px" }}
                              >
                                <div
                                  style={{
                                    height: 3,
                                    borderRadius: 99,
                                    background: isSelected
                                      ? PRIMARY_COLOR
                                      : "rgba(0,0,0,0.06)",
                                  }}
                                />
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="d-flex flex-wrap justify-content-end gap-2 mt-4 pt-3 border-top">
                <button className="btn btn-outline-secondary" onClick={() => navigate("/")}>
                  Cancelar
                </button>

                <button
                  className="btn text-white"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  onClick={goStep2}
                  disabled={!selectedPetId}
                >
                  Continuar <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleCreate}>
              {/* Resumen mascota */}
              {selectedPet && (
                <div
                  className="d-flex align-items-center gap-3 p-3 rounded-4 mb-3"
                  style={{
                    background: "rgba(30,199,166,0.10)",
                    border: "1px solid rgba(30,199,166,0.18)",
                  }}
                >
                  <div
                    className="rounded-3 overflow-hidden bg-white border"
                    style={{ width: 54, height: 54 }}
                  >
                    <img
                      src={petPhotoSrc(selectedPet)}
                      alt={selectedPet.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.src = "/storage/pet.png";
                      }}
                    />
                  </div>

                  <div className="flex-grow-1">
                    <div className="fw-semibold">
                      Mascota seleccionada: {selectedPet.name}
                    </div>
                    <div className="text-muted small">
                      {selectedPet.species} • {selectedPet.breed || "Sin raza"} • ID #{selectedPet.id}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setStep(1)}
                  >
                    Cambiar
                  </button>
                </div>
              )}

              <div className="row g-3">
                {/* Veterinario */}
                <div className="col-12">
                  <label className="form-label">Veterinario</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <select
                      className="form-select"
                      value={selectedVetId}
                      onChange={(e) => setSelectedVetId(e.target.value)}
                      required
                    >
                      <option value="">-- Selecciona un veterinario --</option>
                      {vets.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fecha y hora */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Fecha y hora</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-calendar-event"></i>
                    </span>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-text">
                  </div>
                </div>

                {/* Notas */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Notas (opcional)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-journal-text"></i>
                    </span>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: tos, decaimiento, control..."
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left me-2"></i>Volver
                </button>

                <button
                  type="submit"
                  className="btn text-white"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  disabled={loading}
                >
                  <i className="bi bi-check2-circle me-2"></i>
                  {loading ? "Creando..." : "Crear consulta médica"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
