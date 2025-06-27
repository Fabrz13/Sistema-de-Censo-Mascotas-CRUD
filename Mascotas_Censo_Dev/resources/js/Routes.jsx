import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PetList from './components/pets/PetList';
import PetForm from './components/pets/PetForm';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={
                    <PrivateRoute>
                        <PetList />
                    </PrivateRoute>
                } />
                
                <Route path="/pets/new" element={
                    <PrivateRoute>
                        <PetForm />
                    </PrivateRoute>
                } />

                <Route path="/pets/:id" element={
                <PrivateRoute>
                    <PetForm action="view" />
                </PrivateRoute>
                } />

                <Route path="/pets/:id/edit" element={
                    <PrivateRoute>
                        <PetForm action="edit" />
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    );
}