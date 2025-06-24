import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function VaccinationReport() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true);
                const params = {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                };
                const response = await api.getVaccinationReport(params);
                setReportData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching vaccination report:', error);
                setLoading(false);
            }
        };

        fetchReportData();
    }, [startDate, endDate]);

    const prepareChartData = () => {
        return reportData.map(item => ({
            name: item.month,
            Vacunados: item.vaccinated_count,
            'No Vacunados': item.not_vaccinated_count
        }));
    };

    if (loading) return <div className="text-center">Cargando reporte...</div>;

    return (
        <div className="card">
            <div className="card-header">
                <h3>Reporte de Vacunación</h3>
            </div>
            <div className="card-body">
                <div className="row mb-4">
                    <div className="col-md-3">
                        <label>Fecha de inicio</label>
                        <DatePicker
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-3">
                        <label>Fecha de fin</label>
                        <DatePicker
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            className="form-control"
                        />
                    </div>
                </div>

                {reportData.length > 0 ? (
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={prepareChartData()}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Vacunados" fill="#8884d8" />
                                <Bar dataKey="No Vacunados" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="alert alert-info">No hay datos para el período seleccionado</div>
                )}

                <div className="mt-4">
                    <h5>Resumen</h5>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Mes</th>
                                <th>Vacunados</th>
                                <th>No Vacunados</th>
                                <th>Porcentaje Vacunados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.month}</td>
                                    <td>{item.vaccinated_count}</td>
                                    <td>{item.not_vaccinated_count}</td>
                                    <td>
                                        {`${Math.round(
                                            (item.vaccinated_count + item.not_vaccinated_count) > 0
                                                ? (item.vaccinated_count / (item.vaccinated_count + item.not_vaccinated_count)) * 100
                                                : 0
                                        )}%`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default VaccinationReport;