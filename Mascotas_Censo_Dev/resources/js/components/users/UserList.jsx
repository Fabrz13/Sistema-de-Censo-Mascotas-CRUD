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

  const navigate = useNavigate();
  const { currentUser } = useAuth();

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

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas deshabilitar este usuario?')) return;
    try {
      await api.deleteUser(id);
      await fetchUsers();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'No se pudo deshabilitar el usuario');
    }
  };

  const filteredData = useMemo(() => {
    const nameQ = filters.name.toLowerCase();
    const emailQ = filters.email.toLowerCase();

    return originalData.filter(u => {
      const n = (u.name || '').toLowerCase();
      const em = (u.email || '').toLowerCase();
      const matchName = nameQ ? n.includes(nameQ) : true;
      const matchEmail = emailQ ? em.includes(emailQ) : true;
      return matchName && matchEmail;
    });
  }, [originalData, filters]);

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
    {
      accessorKey: 'created_at',
      header: 'Creación',
      cell: info => {
        const raw = info.getValue();
        if (!raw) return '-';
        return new Date(raw).toLocaleString();
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => (
        <span className={`badge ${info.getValue() === 'HABILITADO' ? 'bg-success' : 'bg-danger'}`}>
          {info.getValue()}
        </span>
      )
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
          <Link to={`/users/${info.getValue()}/edit`} className="btn btn-sm btn-warning">
            <i className="bi bi-pencil"></i>
          </Link>
          <button
            onClick={() => handleDelete(info.getValue())}
            className="btn btn-sm btn-danger"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  if (!isSuperadmin) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          No autorizado.
        </div>
      </div>
    );
  }

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
