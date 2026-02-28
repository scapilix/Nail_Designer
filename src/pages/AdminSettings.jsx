import React, { useState } from 'react';
import { Settings, Globe, Clock, Palette, Bell, Shield, Save, Users, MessageSquare } from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    salon_name: 'TO Beauty',
    phone: '+351 912 345 678',
    email: 'info@tobeauty.pt',
    address: 'Rua da Beleza, 123, Lisboa',
    opening_hours: '09:00 - 20:00',
    days_open: 'Segunda a Sábado',
    slot_duration: 15,
    allow_online_booking: true,
    auto_confirm_booking: false,
    send_sms_reminder: true,
    reminder_hours_before: 24,
    max_advance_days: 30,
    primary_color: '#B48228',
    currency: 'EUR',
    timezone: 'Europe/Lisbon',
  });

  const handleChange = (key, value) => setSettings({ ...settings, [key]: value });
  const handleSave = () => { alert('Definições guardadas com sucesso!'); };

  const tabs = [
    { id: 'general', label: 'Geral', icon: <Settings size={16} /> },
    { id: 'booking', label: 'Agendamento', icon: <Clock size={16} /> },
    { id: 'notifications', label: 'Notificações', icon: <Bell size={16} /> },
    { id: 'appearance', label: 'Aparência', icon: <Palette size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Definições</h1><p className="text-muted text-sm mt-1">Configurações do sistema</p></div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2"><Save size={16} /> Guardar</button>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-slate-50 hover:text-dark'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 card p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark border-b border-border-main pb-3">Informações do Salão</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Nome do Salão</label><input value={settings.salon_name} onChange={e => handleChange('salon_name', e.target.value)} className="luxury-input" /></div>
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Telefone</label><input value={settings.phone} onChange={e => handleChange('phone', e.target.value)} className="luxury-input" /></div>
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Email</label><input value={settings.email} onChange={e => handleChange('email', e.target.value)} className="luxury-input" /></div>
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Morada</label><input value={settings.address} onChange={e => handleChange('address', e.target.value)} className="luxury-input" /></div>
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Horário</label><input value={settings.opening_hours} onChange={e => handleChange('opening_hours', e.target.value)} className="luxury-input" /></div>
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Dias Abertos</label><input value={settings.days_open} onChange={e => handleChange('days_open', e.target.value)} className="luxury-input" /></div>
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark border-b border-border-main pb-3">Configurações de Agendamento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Duração do Slot (min)</label><input type="number" value={settings.slot_duration} onChange={e => handleChange('slot_duration', Number(e.target.value))} className="luxury-input" /></div>
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Máx. Dias para Agendar</label><input type="number" value={settings.max_advance_days} onChange={e => handleChange('max_advance_days', Number(e.target.value))} className="luxury-input" /></div>
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.allow_online_booking} onChange={e => handleChange('allow_online_booking', e.target.checked)} className="w-4 h-4 rounded border-border-main text-primary" />
                  <span className="text-sm font-medium text-dark">Permitir agendamento online</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.auto_confirm_booking} onChange={e => handleChange('auto_confirm_booking', e.target.checked)} className="w-4 h-4 rounded border-border-main text-primary" />
                  <span className="text-sm font-medium text-dark">Confirmar automaticamente</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark border-b border-border-main pb-3">Notificações</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.send_sms_reminder} onChange={e => handleChange('send_sms_reminder', e.target.checked)} className="w-4 h-4 rounded border-border-main text-primary" />
                  <span className="text-sm font-medium text-dark">Enviar lembrete por SMS</span>
                </label>
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Horas antes do lembrete</label><input type="number" value={settings.reminder_hours_before} onChange={e => handleChange('reminder_hours_before', Number(e.target.value))} className="luxury-input w-40" /></div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark border-b border-border-main pb-3">Aparência</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">Cor Principal</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={settings.primary_color} onChange={e => handleChange('primary_color', e.target.value)} className="w-10 h-10 rounded border border-border-main cursor-pointer" />
                    <input value={settings.primary_color} onChange={e => handleChange('primary_color', e.target.value)} className="luxury-input" />
                  </div>
                </div>
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Moeda</label>
                  <select value={settings.currency} onChange={e => handleChange('currency', e.target.value)} className="luxury-input">
                    <option value="EUR">EUR (€)</option><option value="BRL">BRL (R$)</option><option value="USD">USD ($)</option>
                  </select>
                </div>
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Fuso Horário</label>
                  <select value={settings.timezone} onChange={e => handleChange('timezone', e.target.value)} className="luxury-input">
                    <option value="Europe/Lisbon">Europe/Lisbon</option><option value="America/Sao_Paulo">America/Sao_Paulo</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
