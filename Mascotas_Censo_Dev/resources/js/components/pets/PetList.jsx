import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import api from '../../services/api';

// ✅ CAMBIO: importar useAuth para leer rol del usuario actual
import { useAuth } from '@context/AuthContext';

function PetList() {
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        species: '',
        vaccinated: ''
    });
    const navigate = useNavigate();

    // ✅ CAMBIO: detectar si el usuario es veterinario
    const { currentUser } = useAuth();
    const isVeterinario = currentUser?.role === 'veterinario';

    const handleDelete = async (petId) => {
        if (window.confirm('¿Estás seguro de deshabilitar esta mascota?')) {
            try {
                await api.deletePet(petId);
                // Actualizar lista después de deshabilitar
                const response = await api.getPets();
                setOriginalData(response.data);
            } catch (error) {
                console.error('Error deleting pet:', error);
            }
        }
    };

    // Columnas de la tabla (versión v8)
    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nombre',
            cell: info => <span className="fw-semibold">{info.getValue()}</span>
        },
        {
            accessorKey: 'species',
            header: 'Especie',
            cell: info => (
                <span className={`badge ${info.getValue() === 'perro' ? 'bg-primary' : info.getValue() === 'gato' ? 'bg-success' : 'bg-warning'}`}>
                    {info.getValue()}
                </span>
            )
        },
        {
            accessorKey: 'breed',
            header: 'Raza'
        },
        {
            accessorKey: 'size',
            header: 'Tamaño',
            cell: info => (
                <span className="text-capitalize">{info.getValue()}</span>
            )
        },
        {
            accessorKey: 'vaccinated',
            header: 'Vacunado',
            cell: info => (
                <span className={`badge ${info.getValue() ? 'bg-success' : 'bg-danger'}`}>
                    {info.getValue() ? 'Sí' : 'No'}
                </span>
            )
        },
        {
            accessorKey: 'id',
            header: 'Acciones',
            cell: info => (
                <div className="d-flex gap-2">
                    {/* ✅ SIEMPRE: el botón de ver */}
                    <Link to={`/pets/${info.getValue()}`} className="btn btn-sm btn-info">
                        <i className="bi bi-eye"></i>
                    </Link>

                    {/* ✅ CAMBIO: Veterinario NO ve editar ni eliminar */}
                    {!isVeterinario && (
                        <>
                            <Link to={`/pets/${info.getValue()}/edit`} className="btn btn-sm btn-warning">
                                <i className="bi bi-pencil"></i>
                            </Link>
                            <button 
                                onClick={() => handleDelete(info.getValue())} 
                                className="btn btn-sm btn-danger"
                            >
                                <i className="bi bi-trash"></i>
                            </button>
                        </>
                    )}
                </div>
            ),
            enableSorting: false
        }
    ], [isVeterinario]);

    // Filtrar datos
    const filteredData = useMemo(() => {
        return originalData.filter(pet => {
            const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesSpecies = filters.species ? pet.species === filters.species : true;
            const matchesVaccination = filters.vaccinated !== '' ? pet.vaccinated === (filters.vaccinated === 'true') : true;

            return matchesSearch && matchesSpecies && matchesVaccination;
        });
    }, [originalData, searchTerm, filters]);

    // Configuración de la tabla v8
    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10
            }
        }
    });

    // Obtener datos de las mascotas
    useEffect(() => {
        const fetchPets = async () => {
            try {
                const response = await api.getPets();
                setOriginalData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching pets:', error);
                setLoading(false);
            }
        };

        fetchPets();
    }, []);

    if (loading) return <div className="text-center py-5">Cargando mascotas...</div>;

    return (
        <div className="container py-4">
            {/* Barra superior con título y botones */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Sistema de Censo de Mascotas</h1>

                {/* ✅ CAMBIO: Veterinario NO ve "Nueva Mascota" */}
                <div>
                    {!isVeterinario && (
                        <Link to="/pets/new" className="btn btn-primary me-2">
                            <i className="bi bi-plus-circle me-2"></i>Nueva Mascota
                        </Link>
                    )}
                </div>
            </div>

            {/* Filtros de búsqueda */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre o raza"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <select
                        className="form-control"
                        value={filters.species}
                        onChange={(e) => setFilters({...filters, species: e.target.value})}
                    >
                        <option value="">Todas las especies</option>
                        <option value="perro">Perro</option>
                        <option value="gato">Gato</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <select
                        className="form-control"
                        value={filters.vaccinated}
                        onChange={(e) => setFilters({...filters, vaccinated: e.target.value})}
                    >
                        <option value="">Todos</option>
                        <option value="true">Vacunados</option>
                        <option value="false">No vacunados</option>
                    </select>
                </div>
            </div>

            {/* Tabla v8 */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} colSpan={header.colSpan}
                                                onClick={header.column.getToggleSortingHandler()}
                                                style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                                            >
                                                <div className="d-flex align-items-center">
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {header.column.getCanSort() && (
                                                        <span className="ms-2">
                                                            {{
                                                                asc: <i className="bi bi-sort-up"></i>,
                                                                desc: <i className="bi bi-sort-down"></i>,
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
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
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

                    {/* Paginación v8 */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="d-flex align-items-center gap-2">
                            <span>Mostrar:</span>
                            <select
                                className="form-select form-select-sm w-auto"
                                value={table.getState().pagination.pageSize}
                                onChange={e => table.setPageSize(Number(e.target.value))}
                            >
                                {[5, 10, 20, 30, 50].map(size => (
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
                                Página{' '}
                                <strong>
                                    {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                                </strong>
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

export default PetList;
