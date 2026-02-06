import React, { useState, useEffect, useMemo } from 'react';
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

function PetList() {
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ species: '', vaccinated: '' });

  const { currentUser } = useAuth();
  const isVeterinario = currentUser?.role === 'veterinario';

  const handleDelete = async (petId) => {
    if (!window.confirm('¿Estás seguro de deshabilitar esta mascota?')) return;

    try {
      await api.deletePet(petId);
      const response = await api.getPets();
      setOriginalData(response.data);
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('No se pudo deshabilitar la mascota.');
    }
  };

  const speciesBadge = (species) => {
    const s = (species || '').toLowerCase();
    if (s === 'perro') return 'bg-primary';
    if (s === 'gato') return 'bg-success';
    return 'bg-warning text-dark';
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: (info) => <span className="fw-semibold">{info.getValue()}</span>
      },
      {
        accessorKey: 'species',
        header: 'Especie',
        cell: (info) => (
          <span className={`badge ${speciesBadge(info.getValue())}`}>
            {info.getValue()}
          </span>
        )
      },
      {
        accessorKey: 'breed',
        header: 'Raza',
        cell: (info) => info.getValue() || '-'
      },
      {
        accessorKey: 'size',
        header: 'Tamaño',
        cell: (info) => <span className="text-capitalize">{info.getValue()}</span>
      },
      {
        accessorKey: 'vaccinated',
        header: 'Vacunado',
        cell: (info) => (
          <span className={`badge ${info.getValue() ? 'bg-success' : 'bg-danger'}`}>
            {info.getValue() ? 'Sí' : 'No'}
          </span>
        )
      },
      {
        accessorKey: 'id',
        header: 'Acciones',
        enableSorting: false,
        cell: (info) => (
          <div className="d-flex gap-2">
            <Link to={`/pets/${info.getValue()}`} className="btn btn-sm btn-outline-info">
              <i className="bi bi-eye"></i>
            </Link>

            {!isVeterinario && (
              <>
                <Link to={`/pets/${info.getValue()}/edit`} className="btn btn-sm btn-outline-warning">
                  <i className="bi bi-pencil"></i>
                </Link>

                <button
                  onClick={() => handleDelete(info.getValue())}
                  className="btn btn-sm btn-outline-danger"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </>
            )}
          </div>
        )
      }
    ],
    [isVeterinario]
  );

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return originalData.filter((pet) => {
      const name = (pet.name || '').toLowerCase();
      const breed = (pet.breed || '').toLowerCase();

      const matchesSearch = q ? (name.includes(q) || breed.includes(q)) : true;
      const matchesSpecies = filters.species ? pet.species === filters.species : true;

      const matchesVaccination =
        filters.vaccinated !== ''
          ? pet.vaccinated === (filters.vaccinated === 'true')
          : true;

      return matchesSearch && matchesSpecies && matchesVaccination;
    });
  }, [originalData, searchTerm, filters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await api.getPets();
        setOriginalData(response.data);
      } catch (error) {
        console.error('Error fetching pets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  if (loading) return <div className="text-center py-5">Cargando mascotas...</div>;

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
                <i className="bi bi-house-heart fs-4"></i>
              </div>

              <div>
                <h1 className="h4 mb-1">Mis Mascotas</h1>
                <div className="text-muted small">
                  Administra el registro, estado y vacunación de tus mascotas
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

              {/* ✅ Botón normal (desktop) */}
              {!isVeterinario && (
                <Link
                  to="/pets/new"
                  className="btn text-white d-none d-md-inline-flex align-items-center"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Nueva Mascota
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Toolbar filtros */}
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre o raza"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-12 col-md-3">
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

              <div className="col-12 col-md-3">
                <select
                  className="form-select"
                  value={filters.vaccinated}
                  onChange={(e) => setFilters({ ...filters, vaccinated: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="true">Vacunados</option>
                  <option value="false">No vacunados</option>
                </select>
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
                        No se encontraron mascotas
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

      {/* ✅ BOTÓN FLOTANTE (mobile y también opcional desktop, pero aquí solo mobile) */}
      {!isVeterinario && (
        <Link
          to="/pets/new"
          className="btn text-white d-md-none"
          title="Nueva Mascota"
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
          <i className="bi bi-plus-lg fs-4"></i>
        </Link>
      )}
    </div>
  );
}

export default PetList;
