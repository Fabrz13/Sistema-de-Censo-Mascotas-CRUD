import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const PRIMARY_COLOR = '#1EC7A6';
const SOFT_BG = 'rgba(30,199,166,0.10)';

const Sidebar = ({ expanded, toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const roleLabels = {
    superadmin: 'Super Administrador',
    veterinario: 'Veterinario',
  };

  const mascotasLabelByRole = {
    cliente: 'Mis Mascotas',
    veterinario: 'Mis Pacientes',
    superadmin: 'Lista de Mascotas',
  };

  const mascotasLabel = mascotasLabelByRole[currentUser?.role] || 'Lista de Mascotas';

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (active) =>
    `nav-link d-flex align-items-center gap-2 ${active ? 'active' : ''}`;

  return (
    <aside
      className={`sidebar d-flex flex-column ${expanded ? 'expanded' : 'collapsed'}`}
      style={{
        background: '#ffffff',
        color: '#111827',
        minHeight: '100vh',
        borderRight: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="sidebar-header px-3 py-3 d-flex align-items-center justify-content-between"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="d-flex align-items-center gap-2">
          {/* ✅ Si está colapsado, VL se convierte en botón para expandir */}
          {!expanded ? (
            <button
              onClick={toggleSidebar}
              className="btn border-0 d-inline-flex align-items-center justify-content-center rounded"
              title="Expandir"
              style={{
                width: 38,
                height: 38,
                background: SOFT_BG,
                color: PRIMARY_COLOR,
                fontWeight: 800,
              }}
            >
              VL
            </button>
          ) : (
            <div
              className="d-inline-flex align-items-center justify-content-center rounded"
              style={{
                width: 38,
                height: 38,
                background: SOFT_BG,
                color: PRIMARY_COLOR,
                fontWeight: 800,
              }}
            >
              VL
            </div>
          )}

          {expanded && (
            <div className="d-flex flex-column lh-1">
              <span className="fw-bold" style={{ fontSize: '1rem' }}>
                Vet Lomas
              </span>
              <small className="text-muted">Panel</small>
            </div>
          )}
        </div>

        {/* Botón colapsar/expandir */}
        <button
          onClick={toggleSidebar}
          className="btn btn-sm border-0"
          title={expanded ? 'Colapsar' : 'Expandir'}
          style={{
            width: 36,
            height: 36,
            background: SOFT_BG,
            color: PRIMARY_COLOR,
          }}
        >
          <i className={`bi ${expanded ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
        </button>
      </div>

      {/* Perfil */}
      <div
        className="user-profile px-3 py-3 text-center"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        {currentUser && (
          <>
            <div className="mb-2 d-flex justify-content-center">
              <img
                src={
                  currentUser?.photo_path ? `/storage/${currentUser.photo_path}` : '/storage/user.png'
                }
                onError={(e) => {
                  e.currentTarget.src = '/storage/user.png';
                }}
                alt="User profile"
                className="rounded-circle"
                style={{
                  width: expanded ? 74 : 42,
                  height: expanded ? 74 : 42,
                  objectFit: 'cover',
                  border: `2px solid ${SOFT_BG}`,
                }}
              />
            </div>

            {expanded && (
              <>
                <div className="fw-semibold">{currentUser.name}</div>

                {(currentUser.role === 'superadmin' || currentUser.role === 'veterinario') && (
                  <small className="d-inline-flex align-items-center gap-1 text-muted">
                    <i className="bi bi-shield-check" style={{ color: PRIMARY_COLOR }}></i>
                    {roleLabels[currentUser.role]}
                  </small>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Menú */}
      <nav className="flex-grow-1 px-2 py-2">
        <ul className="nav flex-column gap-1">
          <li className="nav-item">
            <Link
              to="/profile"
              className={linkClass(isActive('/profile'))}
              title={!expanded ? 'Mi Perfil' : undefined}
            >
              <i className="bi bi-person"></i>
              {expanded && <span>Mi Perfil</span>}
            </Link>
          </li>

          {currentUser?.role !== 'veterinario' && (
            <li className="nav-item">
              <Link
                to="/medical-consultations/schedule"
                className={linkClass(isActive('/medical-consultations/schedule'))}
                title={!expanded ? 'Agendar cita médica' : undefined}
              >
                <i className="bi bi-calendar-plus"></i>
                {expanded && <span>Agendar Cita Médica</span>}
              </Link>
            </li>
          )}

          <li className="nav-item">
            <Link
              to="/medical-consultations"
              className={linkClass(isActive('/medical-consultations'))}
              title={!expanded ? 'Mis Citas' : undefined}
            >
              <i className="bi bi-clipboard2-pulse"></i>
              {expanded && (
                <span>{currentUser?.role === 'superadmin' ? 'Citas Veterinarias' : 'Mis Citas'}</span>
              )}
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/"
              className={linkClass(isActive('/'))}
              title={!expanded ? mascotasLabel : undefined}
            >
              <i className="bi bi-list-ul"></i>
              {expanded && <span>{mascotasLabel}</span>}
            </Link>
          </li>

          {currentUser?.role === 'superadmin' && (
            <li className="nav-item">
              <Link
                to="/users"
                className={linkClass(isActive('/users'))}
                title={!expanded ? 'Usuarios' : undefined}
              >
                <i className="bi bi-people"></i>
                {expanded && <span>Usuarios</span>}
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Footer acciones */}
      <div className="px-2 pb-2">
        <button
          onClick={handleLogout}
          className="btn w-100 d-flex align-items-center justify-content-center gap-2"
          style={{
            background: SOFT_BG,
            color: '#111827',
            border: '1px solid rgba(30,199,166,0.35)',
          }}
          title={!expanded ? 'Cerrar Sesión' : undefined}
        >
          <i className="bi bi-box-arrow-right" style={{ color: PRIMARY_COLOR }}></i>
          {expanded && <span>Cerrar Sesión</span>}
        </button>
      </div>

      {/* Marca */}
      <div
        className="d-flex flex-column align-items-center justify-content-center py-3"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <img
          src="pet-health.png"
          alt="Logo"
          style={{
            width: expanded ? 62 : 30,
            height: expanded ? 62 : 30,
            transition: 'all 0.2s ease',
            objectFit: 'contain',
          }}
        />

        {expanded && (
          <small className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
            Lo mejor para tu mascota
          </small>
        )}

        <div
          className="mt-2"
          style={{
            width: 44,
            height: 3,
            borderRadius: 50,
            background: PRIMARY_COLOR,
            opacity: 0.9,
          }}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
