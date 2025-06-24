import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PetList from './components/pets/PetList';
import PetForm from './components/pets/PetForm';
import PetDetail from './components/pets/PetDetail';
import VaccinationReport from './components/pets/VaccinationReport';

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<PetList />} />
                <Route path="/pets/new" element={<PetForm />} />
                <Route path="/pets/:id" element={<PetDetail />} />
                <Route path="/pets/:id/edit" element={<PetForm />} />
                <Route path="/vaccination-report" element={<VaccinationReport />} />
            </Routes>
        </Router>
    );
}