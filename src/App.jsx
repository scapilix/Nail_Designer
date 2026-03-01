import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { applyPrimaryColor } from './lib/colorUtils';
import { supabase } from './lib/supabase';
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
import AdminOrders from './pages/AdminOrders';
import AdminCommissions from './pages/AdminCommissions';
import AdminCashier from './pages/AdminCashier';
import AdminGoals from './pages/AdminGoals';
import AdminReports from './pages/AdminReports';
import AdminAnamnesis from './pages/AdminAnamnesis';
import AdminOnlineBooking from './pages/AdminOnlineBooking';
import AdminWhatsApp from './pages/AdminWhatsApp';

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

  // Load saved primary color on app startup
  useEffect(() => {
    // Instant load from localStorage
    const cached = localStorage.getItem('primary_color');
    if (cached) applyPrimaryColor(cached);

    // Authoritative load from Supabase
    supabase.from('settings').select('primary_color').limit(1).single()
      .then(({ data }) => {
        if (data?.primary_color) {
          applyPrimaryColor(data.primary_color);
          localStorage.setItem('primary_color', data.primary_color);
        }
      })
      .catch(() => {}); // settings table may not exist yet
  }, []);

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
            <Route path="orders" element={<AdminOrders />} />
            <Route path="commissions" element={<AdminCommissions />} />
            <Route path="cashier" element={<AdminCashier />} />
            <Route path="goals" element={<AdminGoals />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="anamnesis" element={<AdminAnamnesis />} />
            <Route path="online-booking" element={<AdminOnlineBooking />} />
            <Route path="whatsapp" element={<AdminWhatsApp />} />
          </Route>
        </Routes>
      </ImageProvider>
    </ThemeProvider>
  );
}

export default App;
