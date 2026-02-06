import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

// 🎨 Color principal
const PRIMARY_COLOR = '#1EC7A6';
const PRIMARY_SOFT = 'rgba(30,199,166,0.14)';
const PRIMARY_SOFT_2 = 'rgba(30,199,166,0.08)';

export default function UserList() {
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ name: '', email: '' });
  const [showDisabled, setShowDisabled] = useState(false);

  const navigate = useNavigate();
  const { currentUser, loading: authLoading, token } = useAuth();

  const isSuperadmin = currentUser?.role === 'superadmin';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      setOriginalData(res.data);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperadmin) return;
    fetchUsers();
  }, [isSuperadmin]);

  const normalizeStatus = (status) => (status || '').toString().trim().toUpperCase();

  const formatDate = (raw) => {
    if (!raw) return '-';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString();
  };

  const handleDisable = async (id) => {
    if (!window.confirm('¿Seguro que deseas deshabilitar este usuario?')) return;
    try {
      await api.deleteUser(id);
      await fetchUsers();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'No se pudo deshabilitar el usuario');
    }
  };

  const handleEnable = async (id) => {
    if (!window.confirm('¿Seguro que deseas habilitar este usuario nuevamente?')) return;

    try {
      if (typeof api.enableUser === 'function') {
        await api.enableUser(id);
      } else if (typeof api.restoreUser === 'function') {
        await api.restoreUser(id);
      } else if (typeof api.updateUserStatus === 'function') {
        await api.updateUserStatus(id, 'HABILITADO');
      } else {
        throw new Error('No existe api.enableUser / api.restoreUser / api.updateUserStatus en services/api.js');
      }

      await fetchUsers();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'No se pudo habilitar el usuario');
    }
  };

  // ✅ Contadores globales (dataset completo)
  const counts = useMemo(() => {
    let enabled = 0;
    let disabled = 0;

    for (const u of originalData) {
      const st = normalizeStatus(u.status);
      if (st === 'DESHABILITADO') disabled++;
      else enabled++;
    }

    return { enabled, disabled };
  }, [originalData]);

  const filteredData = useMemo(() => {
    const nameQ = filters.name.toLowerCase().trim();
    const emailQ = filters.email.toLowerCase().trim();

    const desiredStatus = showDisabled ? 'DESHABILITADO' : 'HABILITADO';

    return originalData.filter((u) => {
      const n = (u.name || '').toLowerCase();
      const em = (u.email || '').toLowerCase();

      const matchName = nameQ ? n.includes(nameQ) : true;
      const matchEmail = emailQ ? em.includes(emailQ) : true;

      const st = normalizeStatus(u.status);
      const matchStatus = st === desiredStatus;

      return matchName && matchEmail && matchStatus;
    });
  }, [originalData, filters, showDisabled]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: (info) => <span className="fw-semibold">{info.getValue()}</span>
      },
      { accessorKey: 'email', header: 'Correo' },
      { accessorKey: 'phone', header: 'Teléfono' },
      { accessorKey: 'address', header: 'Dirección' },

      {
        id: showDisabled ? 'disabled_date' : 'created_date',
        accessorFn: (row) => (showDisabled ? row.disabled_at || row.deleted_at || null : row.created_at || null),
        header: showDisabled ? 'Fecha deshabilitación' : 'Creación',
        cell: (info) => formatDate(info.getValue())
      },

      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const v = normalizeStatus(info.getValue());
          const isEnabled = v === 'HABILITADO';
          return (
            <span className={`badge ${isEnabled ? 'bg-success' : 'bg-danger'}`}>
              {isEnabled ? 'HABILITADO' : 'DESHABILITADO'}
            </span>
          );
        }
      },

      {
        accessorKey: 'id',
        header: 'Acciones',
        enableSorting: false,
        cell: (info) => (
          <div className="d-flex gap-2">
            <Link to={`/users/${info.getValue()}`} className="btn btn-sm btn-outline-info" title="Ver">
              <i className="bi bi-eye"></i>
            </Link>

            {!showDisabled && (
              <Link to={`/users/${info.getValue()}/edit`} className="btn btn-sm btn-outline-warning" title="Editar">
                <i className="bi bi-pencil"></i>
              </Link>
            )}

            {!showDisabled ? (
              <button
                onClick={() => handleDisable(info.getValue())}
                className="btn btn-sm btn-outline-danger"
                title="Deshabilitar"
              >
                <i className="bi bi-trash"></i>
              </button>
            ) : (
              <button
                onClick={() => handleEnable(info.getValue())}
                className="btn btn-sm btn-outline-success"
                title="Habilitar"
              >
                <i className="bi bi-check2-circle"></i>
              </button>
            )}
          </div>
        )
      }
    ],
    [showDisabled]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  // ✅ Fix: no mostrar "No autorizado" mientras se está resolviendo sesión
  if (authLoading) return <div className="text-center py-5">Cargando sesión...</div>;
  if (!token) return <div className="text-center py-5">Redirigiendo...</div>;

  if (!isSuperadmin) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">No autorizado.</div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-5">Cargando usuarios...</div>;

  return (
    <div
      className="container-fluid py-4"
      style={{ background: `linear-gradient(180deg, ${PRIMARY_SOFT_2}, #ffffff)` }}
    >
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h1 className="mb-1">Usuarios</h1>
            <div className="text-muted">Administra usuarios habilitados y deshabilitados</div>
          </div>

          <Link to="/users/new" className="btn text-white" style={{ backgroundColor: PRIMARY_COLOR }}>
            <i className="bi bi-plus-circle me-2"></i>
            Crear usuario
          </Link>
        </div>

        {/* Filtros */}
        <div className="card shadow-sm mb-3 border-0 rounded-4">
          <div className="card-body">
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <label className="form-label small text-muted">Buscar por nombre</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    className="form-control"
                    placeholder="Ej: Juan Pérez"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small text-muted">Buscar por correo</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    className="form-control"
                    placeholder="Ej: correo@censo.com"
                    value={filters.email}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
              {/* Tabs */}
              <div className="btn-group" role="group" aria-label="Filtro por status">
                <button
                  type="button"
                  className={`btn btn-sm ${!showDisabled ? '' : 'btn-outline-secondary'}`}
                  style={!showDisabled ? { backgroundColor: PRIMARY_COLOR, color: 'white', borderColor: PRIMARY_COLOR } : {}}
                  onClick={() => setShowDisabled(false)}
                >
                  Habilitados <span className="badge text-bg-light ms-2">{counts.enabled}</span>
                </button>

                <button
                  type="button"
                  className={`btn btn-sm ${showDisabled ? '' : 'btn-outline-secondary'}`}
                  style={showDisabled ? { backgroundColor: PRIMARY_COLOR, color: 'white', borderColor: PRIMARY_COLOR } : {}}
                  onClick={() => setShowDisabled(true)}
                >
                  Deshabilitados <span className="badge text-bg-light ms-2">{counts.disabled}</span>
                </button>
              </div>

              <div className="text-muted small">
                Mostrando: <strong>{filteredData.length}</strong> usuario(s)
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((h) => (
                        <th
                          key={h.id}
                          colSpan={h.colSpan}
                          onClick={h.column.getToggleSortingHandler()}
                          style={{
                            cursor: h.column.getCanSort() ? 'pointer' : 'default',
                            userSelect: 'none'
                          }}
                        >
                          <div className="d-flex align-items-center">
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {h.column.getCanSort() && (
                              <span className="ms-2">
                                {{
                                  asc: <i className="bi bi-sort-up"></i>,
                                  desc: <i className="bi bi-sort-down"></i>
                                }[h.column.getIsSorted()] ?? <i className="bi bi-filter"></i>}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-4">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
              <div className="d-flex align-items-center gap-2">
                <span>Mostrar:</span>
                <select
                  className="form-select form-select-sm w-auto"
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                >
                  {[5, 10, 20, 30, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>registros</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <i className="bi bi-chevron-double-left"></i>
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                <span>
                  Página <strong>{table.getState().pagination.pageIndex + 1}</strong> de{' '}
                  <strong>{table.getPageCount()}</strong>
                </span>

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-muted small mt-3">
          © {new Date().getFullYear()} Vet Lomas • Lo mejor para tu mascota
        </div>
      </div>
    </div>
  );
}
