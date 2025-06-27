import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Routes';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './context/AuthContext';
import '../css/app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <MainLayout>
                    <AppRoutes />
                </MainLayout>
            </AuthProvider>
        </BrowserRouter>
    );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

export default App;