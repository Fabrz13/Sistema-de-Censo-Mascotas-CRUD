import { Routes, Route, Navigate } from 'react-router-dom';
import PetList from './components/pets/PetList';
import PetForm from './components/pets/PetForm';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/profile/Profile';
import ScheduleMedicalConsultation from "./components/consultations/ScheduleMedicalConsultation";
import MedicalConsultationList from "./components/consultations/MedicalConsultationList";

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/profile" element={
                <PrivateRoute>
                    <Profile />
                </PrivateRoute>
            } />

            <Route path="/" element={
                <PrivateRoute>
                    <PetList />
                </PrivateRoute>
            } />

            <Route path="/medical-consultations/schedule" element={
                <PrivateRoute>
                    <ScheduleMedicalConsultation />
                </PrivateRoute>
            } />

            <Route path="/medical-consultations" element={
                <PrivateRoute>
                    <MedicalConsultationList />
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
    );
}
