import '../css/app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRoutes from './Routes';

function App() {
    return (
        <div className="container py-4">
            <h1 className="text-center mb-4">Censo de Mascotas</h1>
            <AppRoutes />
        </div>
    );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

export default App;