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

export default function UserList() {
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    name: '',
    email: ''
  });

  // ✅ false => HABILITADOS | true => DESHABILITADOS
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
      await api.deleteUser(id); // tu endpoint actual de deshabilitar
      await fetchUsers();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'No se pudo deshabilitar el usuario');
    }
  };

  // ✅ NUEVO: re-habilitar usuario
  const handleEnable = async (id) => {
    if (!window.confirm('¿Seguro que deseas habilitar este usuario nuevamente?')) return;

    try {
      // ✅ Opción 1 (recomendada): define esto en tu services/api.js
      // api.enableUser = (id) => axios.post(`/users/${id}/enable`)  (ejemplo)
      if (typeof api.enableUser === 'function') {
        await api.enableUser(id);
      }
      // ✅ Opción 2: si tu backend usa "restore" (soft delete)
      else if (typeof api.restoreUser === 'function') {
        await api.restoreUser(id);
      }
      // ✅ Opción 3: si tu backend expone updateStatus genérico
      else if (typeof api.updateUserStatus === 'function') {
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

  // ✅ Contadores (sobre todo el dataset, NO sobre el filtrado por nombre/email)
  const counts = useMemo(() => {
    let enabled = 0;
    let disabled = 0;

    for (const u of originalData) {
      const st = normalizeStatus(u.status);
      if (st === 'DESHABILITADO') disabled++;
      else if (st === 'HABILITADO') enabled++;
      else enabled++;
    }

    return { enabled, disabled };
  }, [originalData]);

  const filteredData = useMemo(() => {
    const nameQ = filters.name.toLowerCase();
    const emailQ = filters.email.toLowerCase();

    const desiredStatus = showDisabled ? 'DESHABILITADO' : 'HABILITADO';

    return originalData.filter(u => {
      const n = (u.name || '').toLowerCase();
      const em = (u.email || '').toLowerCase();

      const matchName = nameQ ? n.includes(nameQ) : true;
      const matchEmail = emailQ ? em.includes(emailQ) : true;

      const st = normalizeStatus(u.status);
      const matchStatus = st === desiredStatus;

      return matchName && matchEmail && matchStatus;
    });
  }, [originalData, filters, showDisabled]);

  // ✅ Columnas dependen del modo (habilitados/deshabilitados)
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: info => <span className="fw-semibold">{info.getValue()}</span>
    },
    {
      accessorKey: 'email',
      header: 'Correo'
    },
    {
      accessorKey: 'phone',
      header: 'Teléfono'
    },
    {
      accessorKey: 'address',
      header: 'Dirección'
    },

    // ✅ ESTA COLUMNA CAMBIA SEGÚN showDisabled
    {
      id: showDisabled ? 'disabled_date' : 'created_date',
      accessorFn: (row) => {
        // cuando está deshabilitado, intentamos tomar disabled_at o deleted_at
        if (showDisabled) return row.disabled_at || row.deleted_at || null;
        return row.created_at || null;
      },
      header: showDisabled ? 'Fecha deshabilitación' : 'Creación',
      cell: info => formatDate(info.getValue())
    },

    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
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
      cell: info => (
        <div className="d-flex gap-2">
          <Link to={`/users/${info.getValue()}`} className="btn btn-sm btn-info">
            <i className="bi bi-eye"></i>
          </Link>

          {/* Edit solo en habilitados (opcional). Si quieres, lo dejo en ambos */}
          {!showDisabled && (
            <Link to={`/users/${info.getValue()}/edit`} className="btn btn-sm btn-warning">
              <i className="bi bi-pencil"></i>
            </Link>
          )}

          {/* ✅ BOTÓN CAMBIA SEGÚN MODO */}
          {!showDisabled ? (
            <button
              onClick={() => handleDisable(info.getValue())}
              className="btn btn-sm btn-danger"
              title="Deshabilitar"
            >
              <i className="bi bi-trash"></i>
            </button>
          ) : (
            <button
              onClick={() => handleEnable(info.getValue())}
              className="btn btn-sm btn-success"
              title="Habilitar"
            >
              <i className="bi bi-check2-circle"></i>
            </button>
          )}
        </div>
      )
    }
  ], [showDisabled]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

    // ✅ Mientras se resuelve la sesión al refrescar, NO muestres "No autorizado"
    if (authLoading) return <div className="text-center py-5">Cargando sesión...</div>;

    // Si no hay token, no debería estar aquí (opcional)
    if (!token) return <div className="text-center py-5">Redirigiendo...</div>;

    // Ya con auth resuelto: si no es superadmin, ahora sí
    if (!isSuperadmin) {
    return (
        <div className="container py-4">
        <div className="alert alert-danger">No autorizado.</div>
        </div>
    );
    }

    // Luego tu loading interno de usuarios
    if (loading) return <div className="text-center py-5">Cargando usuarios...</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Usuarios</h1>
        <Link to="/users/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Crear usuario
        </Link>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Buscar por nombre"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
        </div>
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Buscar por correo"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
          />
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">

          {/* ✅ PILL DENTRO DE LA TABLA (ENCIMA DE LAS COLUMNAS) */}
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div className="btn-group" role="group" aria-label="Filtro por status">
              <button
                type="button"
                className={`btn btn-sm ${!showDisabled ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowDisabled(false)}
              >
                Habilitados <span className="badge text-bg-light ms-2">{counts.enabled}</span>
              </button>

              <button
                type="button"
                className={`btn btn-sm ${showDisabled ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowDisabled(true)}
              >
                Deshabilitados <span className="badge text-bg-light ms-2">{counts.disabled}</span>
              </button>
            </div>

            <div className="text-muted small">
              Mostrando: <strong>{filteredData.length}</strong> usuarios
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th
                        key={h.id}
                        colSpan={h.colSpan}
                        onClick={h.column.getToggleSortingHandler()}
                        style={{ cursor: h.column.getCanSort() ? 'pointer' : 'default' }}
                      >
                        <div className="d-flex align-items-center">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {h.column.getCanSort() && (
                            <span className="ms-2">
                              {{
                                asc: <i className="bi bi-sort-up"></i>,
                                desc: <i className="bi bi-sort-down"></i>,
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
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
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

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="d-flex align-items-center gap-2">
              <span>Mostrar:</span>
              <select
                className="form-select form-select-sm w-auto"
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
              >
                {[5, 10, 20, 30, 50].map(size => (
                  <option key={size} value={size}>{size}</option>
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
                Página <strong>{table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</strong>
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
    </div>
  );
}
