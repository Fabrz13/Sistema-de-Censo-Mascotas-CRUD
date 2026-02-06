import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';

function Login() {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);

    // ✅ CAMBIO: usamos el login del contexto
    const { loginWithToken } = useAuth();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await api.login(credentials);

            // ✅ CAMBIO: esto guarda token y dispara fetchUser automáticamente
            await loginWithToken(response.data.token);

        } catch (err) {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">Iniciar Sesión</div>
                    <div className="card-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-3">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label>Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <button type="submit" className="btn btn-primary">
                                    Ingresar
                                </button>
                                <Link to="/register" className="btn btn-outline-secondary">
                                    Crear una cuenta
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
