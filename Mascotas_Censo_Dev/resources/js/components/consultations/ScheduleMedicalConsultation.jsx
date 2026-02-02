import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

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

  const selectedPet = useMemo(
    () => pets.find(p => String(p.id) === String(selectedPetId)),
    [pets, selectedPetId]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const petsRes = await api.getPets();
        setPets(petsRes.data);

        const vetsRes = await api.getVeterinarians();
        setVets(vetsRes.data);

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
        notes: notes || null
      });

      // ✅ CAMBIO: redirigir a "Mis Citas" automáticamente
      navigate("/medical-consultations");

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Error al crear la consulta médica.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Agendar cita médica</h4>
        </div>

        <div className="card-body">
          {step === 1 && (
            <>
              <h5 className="mb-3">Paso 1: Selecciona una mascota</h5>

              {pets.length === 0 ? (
                <div className="alert alert-warning">
                  No tienes mascotas registradas (o no tienes acceso a ninguna mascota).
                </div>
              ) : (
                <div className="list-group">
                  {pets.map(pet => (
                    <button
                      key={pet.id}
                      type="button"
                      className={`list-group-item list-group-item-action ${String(selectedPetId) === String(pet.id) ? "active" : ""}`}
                      onClick={() => setSelectedPetId(String(pet.id))}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{pet.name}</strong> — {pet.species} — {pet.breed}
                        </div>
                        <small>ID #{pet.id}</small>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="d-flex justify-content-end mt-3">
                <button className="btn btn-secondary me-2" onClick={() => navigate("/")}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={goStep2} disabled={!selectedPetId}>
                  Continuar
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleCreate}>
              <h5 className="mb-3">Paso 2: Datos para la cita</h5>

              {selectedPet && (
                <div className="alert alert-info">
                  Mascota seleccionada: <strong>{selectedPet.name}</strong> ({selectedPet.species})
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Veterinario</label>
                <select
                  className="form-control"
                  value={selectedVetId}
                  onChange={(e) => setSelectedVetId(e.target.value)}
                  required
                >
                  <option value="">-- Selecciona un veterinario --</option>
                  {vets.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Fecha y hora</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
                <small className="text-muted">
                  * Por ahora no validamos choque de horarios; lo pulimos después.
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label">Notas (opcional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-between mt-3">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                  Volver
                </button>

                <button type="submit" className="btn btn-success" disabled={loading}>
                  Crear consulta médica
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
