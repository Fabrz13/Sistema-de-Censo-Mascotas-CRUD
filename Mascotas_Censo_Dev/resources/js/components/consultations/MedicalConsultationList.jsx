import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';

const PRIMARY_COLOR = '#1EC7A6';

export default function MedicalConsultationList() {
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchPetName, setSearchPetName] = useState('');
  const [filters, setFilters] = useState({
    species: '',
    breed: ''
  });

  const { currentUser } = useAuth();

  const isCliente = currentUser?.role === 'cliente';
  const canUpdateStatus = currentUser?.role === 'veterinario' || currentUser?.role === 'superadmin';

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await api.getMedicalConsultations();
      setOriginalData(res.data);
    } catch (e) {
      console.error('Error fetching medical consultations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const filteredData = useMemo(() => {
    const qName = searchPetName.toLowerCase();
    const qBreed = (filters.breed || '').toLowerCase();

    return originalData.filter((c) => {
      const petName = (c?.pet?.name || '').toLowerCase();
      const petBreed = (c?.pet?.breed || '').toLowerCase();
      const petSpecies = (c?.pet?.species || '');

      const matchesName = qName ? petName.includes(qName) : true;
      const matchesSpecies = filters.species ? petSpecies === filters.species : true;
      const matchesBreed = qBreed ? petBreed.includes(qBreed) : true;

      return matchesName && matchesSpecies && matchesBreed;
    });
  }, [originalData, searchPetName, filters]);

  const statusBadge = (status) => {
    const map = {
      PENDIENTE: 'bg-secondary',
      CONFIRMADA: 'bg-success',
      CANCELADA: 'bg-danger'
    };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>;
  };

  const handleChangeStatus = async (id, status) => {
    try {
      await api.updateMedicalConsultationStatus(id, status);
      await fetchConsultations();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'No se pudo actualizar el estado');
    }
  };

  // ✅ Columnas base (siempre visibles)
  const baseColumns = useMemo(
    () => [
      {
        accessorKey: 'pet.name',
        header: 'Mascota',
        cell: (info) => <span className="fw-semibold">{info.row.original?.pet?.name}</span>
      },
      {
        accessorKey: 'pet.species',
        header: 'Especie',
        cell: (info) => {
          const val = info.row.original?.pet?.species;
          return (
            <span
              className={`badge ${
                val === 'perro' ? 'bg-primary' : val === 'gato' ? 'bg-success' : 'bg-warning text-dark'
              }`}
            >
              {val}
            </span>
          );
        }
      },
      {
        accessorKey: 'pet.breed',
        header: 'Raza',
        cell: (info) => info.row.original?.pet?.breed || '-'
      },
      {
        accessorKey: 'scheduled_at',
        header: 'Fecha/Hora',
        cell: (info) => {
          const raw = info.row.original?.scheduled_at;
          if (!raw) return '-';
          return new Date(raw).toLocaleString();
        }
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: (info) => statusBadge(info.row.original?.status)
      }
    ],
    []
  );

  // ✅ Columna acciones (solo para veterinario y superadmin)
  const actionsColumn = useMemo(
    () => ({
      accessorKey: 'id',
      header: 'Acciones',
      enableSorting: false,
      cell: (info) => {
        const c = info.row.original;
        const id = c.id;
        const status = c.status;

        return (
          <div className="d-flex gap-2 flex-wrap">
            {canUpdateStatus && (
              <>
                {status === 'PENDIENTE' && (
                  <>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleChangeStatus(id, 'CONFIRMADA')}
                    >
                      Confirmar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleChangeStatus(id, 'CANCELADA')}
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {status === 'CONFIRMADA' && (
                  <>
                    <button className="btn btn-sm btn-outline-success" disabled>
                      CONFIRMADA
                    </button>

                    <Link to={`/pets/${c?.pet?.id}`} className="btn btn-sm btn-primary">
                      Atender al paciente
                    </Link>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleChangeStatus(id, 'CANCELADA')}
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {status === 'CANCELADA' && (
                  <button className="btn btn-sm btn-outline-danger" disabled>
                    CANCELADA
                  </button>
                )}
              </>
            )}
          </div>
        );
      }
    }),
    [canUpdateStatus]
  );

  // ✅ si es cliente, NO agregamos columna acciones
  const columns = useMemo(() => {
    return isCliente ? baseColumns : [...baseColumns, actionsColumn];
  }, [isCliente, baseColumns, actionsColumn]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  if (loading) return <div className="text-center py-5">Cargando citas médicas...</div>;

  const pageTitle = currentUser?.role === 'superadmin' ? 'Citas Veterinarias' : 'Mis Citas';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, rgba(30,199,166,0.20), rgba(255,255,255,1))`
      }}
    >
      <div className="container py-4">

        {/* ✅ TOPBAR tipo dashboard */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 48,
                  height: 48,
                  background: 'rgba(30,199,166,0.15)',
                  color: PRIMARY_COLOR
                }}
              >
                <i className="bi bi-clipboard2-pulse fs-4"></i>
              </div>

              <div>
                <h1 className="h4 mb-1">{pageTitle}</h1>
                <div className="text-muted small">
                  Gestiona y consulta las citas veterinarias registradas
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="badge text-bg-light">
                Total: <strong className="ms-1">{originalData.length}</strong>
              </span>
              <span className="badge text-bg-light">
                Mostrando: <strong className="ms-1">{filteredData.length}</strong>
              </span>

              {/* ✅ Botón normal (desktop) solo para cliente */}
              {isCliente && (
                <Link
                  to="/medical-consultations/schedule"
                  className="btn text-white d-none d-md-inline-flex align-items-center"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  Agendar cita
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Toolbar filtros */}
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre de mascota"
                    value={searchPetName}
                    onChange={(e) => setSearchPetName(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-12 col-md-4">
                <select
                  className="form-select"
                  value={filters.species}
                  onChange={(e) => setFilters({ ...filters, species: e.target.value })}
                >
                  <option value="">Todas las especies</option>
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filtrar por raza"
                  value={filters.breed}
                  onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
                />
              </div>

              <div className="col-12 mt-2 text-muted small">
                Tip: puedes ordenar columnas haciendo clic en el encabezado.
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Tabla */}
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          onClick={header.column.getToggleSortingHandler()}
                          style={{
                            cursor: header.column.getCanSort() ? 'pointer' : 'default',
                            userSelect: 'none'
                          }}
                        >
                          <div className="d-flex align-items-center">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <span className="ms-2">
                                {{
                                  asc: <i className="bi bi-sort-up"></i>,
                                  desc: <i className="bi bi-sort-down"></i>
                                }[header.column.getIsSorted()] ?? <i className="bi bi-filter"></i>}
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
                        No se encontraron citas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ✅ Paginación */}
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
      </div>

      {/* ✅ BOTÓN FLOTANTE (mobile) solo cliente */}
      {isCliente && (
        <Link
          to="/medical-consultations/schedule"
          className="btn text-white d-md-none"
          title="Agendar cita"
          style={{
            position: 'fixed',
            right: 18,
            bottom: 18,
            width: 56,
            height: 56,
            borderRadius: 999,
            backgroundColor: PRIMARY_COLOR,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
            zIndex: 1100
          }}
        >
          <i className="bi bi-calendar-plus fs-4"></i>
        </Link>
      )}
    </div>
  );
}
