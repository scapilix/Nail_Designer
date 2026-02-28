import React, { useEffect } from 'react';
// Build trigger: 2026-02-22 18:35
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import Services from './components/Services';
import Scheduling from './components/Scheduling';
import Loyalty from './components/Loyalty';
import Amenities from './components/Amenities';
import Portfolio from './components/Portfolio';
import Team from './components/Team';
import Feedbacks from './components/Feedbacks';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminServices from './pages/AdminServices';
import AdminBookings from './pages/AdminBookings';
import AdminStore from './pages/AdminStore';
import AdminExpenses from './pages/AdminExpenses';
import AdminInvoices from './pages/AdminInvoices';
import AdminSettings from './pages/AdminSettings';
import AdminTeam from './pages/AdminTeam';
import AdminClientes from './pages/AdminClientes';
import AdminPlans from './pages/AdminPlans';
// Placeholder Pages
const PlaceholderPage = ({ title }) => (
  <div className="card p-12 text-center">
    <h2 className="text-2xl font-bold text-dark mb-2">{title}</h2>
    <p className="text-muted text-sm">Esta secção está em desenvolvimento.</p>
  </div>
);

const PublicPage = () => (
  <div className="animate-fade-in">
    <Navbar />
    <Hero />
    <AboutUs />
    <Services />
    <Scheduling />
    <Loyalty />
    <Amenities />
    <Portfolio />
    <Team />
    <Feedbacks />
    <FAQ />
    <Footer />
  </div>
);

import { ThemeProvider } from './context/ThemeContext';
import { ImageProvider } from './context/ImageContext';

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ThemeProvider>
      <ImageProvider>
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="clients" element={<AdminClientes />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="store" element={<AdminStore />} />
            <Route path="expenses" element={<AdminExpenses />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="settings" element={<AdminSettings />} />
            
            {/* New ERP Modules (Placeholders) */}
            <Route path="orders" element={<PlaceholderPage title="Comandas & Vendas" />} />
            <Route path="commissions" element={<PlaceholderPage title="Gestão de Comissões" />} />
            <Route path="cashier" element={<PlaceholderPage title="Controle de Caixa" />} />
            <Route path="goals" element={<PlaceholderPage title="Metas e Performance" />} />
            <Route path="reports" element={<PlaceholderPage title="Relatórios Avançados" />} />
            <Route path="anamnesis" element={<PlaceholderPage title="Fichas de Anamnese" />} />
            <Route path="online-booking" element={<PlaceholderPage title="Configuração de Agendamento" />} />
            <Route path="whatsapp" element={<PlaceholderPage title="WhatsApp Marketing" />} />
          </Route>
        </Routes>
      </ImageProvider>
    </ThemeProvider>
  );
}


export default App;
