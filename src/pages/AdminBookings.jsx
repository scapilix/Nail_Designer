import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User, CheckCircle, XCircle, Anchor, MoreVertical, X, CalendarDays, Sparkles, Scissors
} from 'lucide-react';

const AdminBookings = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  // Dropdown data
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null); 

  // Form State
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    team_member_id: '',
    booking_date: '',
    booking_time: '09:00',
    status: 'pendente',
    notes: ''
  });

  // Time Tracker Update
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Calculate the current week (Monday to Saturday) - Memoized
  const weekDays = React.useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay(); 
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(d.setHours(0,0,0,0));
    monday.setDate(monday.getDate() - (monday.getDay() === 0 ? 6 : monday.getDay() - 1));
    
    const week = [];
    for(let i = 0; i < 6; i++) {
        const nextDay = new Date(monday);
        nextDay.setDate(monday.getDate() + i);
        week.push(nextDay);
    }
    return week;
  }, [currentDate]);

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const hours = Array.from({ length: 11 }, (_, i) => i + 9); // 9:00 to 19:00

  const fetchDependancies = React.useCallback(async () => {
    const [ {data: c}, {data: s}, {data: t} ] = await Promise.all([
      supabase.from('clients').select('id, name').order('name'),
      supabase.from('services').select('id, name, duration, price').order('name'),
      supabase.from('team').select('id, name, photo_url, role').order('name')
    ]);
    setClients(c || []);
    setServices(s || []);
    setTeam(t || []);
  }, []);

  const fetchBookings = React.useCallback(async () => {
    setLoading(true);
    const startOfWeek = new Date(weekDays[0]);
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(weekDays[5]);
    endOfWeek.setHours(23,59,59,999);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, booking_date, status, notes,
          client:client_id(id, name),
          service:service_id(id, name, duration, price),
          team:team_member_id(id, name, photo_url)
        `)
        .gte('booking_date', startOfWeek.toISOString())
        .lte('booking_date', endOfWeek.toISOString());
      
      if (error) throw error;
      setBookings(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [weekDays]);

  useEffect(() => {
    fetchDependancies();
    fetchBookings();
  }, [currentDate, fetchDependancies, fetchBookings]);

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const openAddModal = () => {
    setSelectedBooking(null);
    setFormData({
      client_id: clients[0]?.id || '',
      service_id: services[0]?.id || '',
      team_member_id: team[0]?.id || '',
      booking_date: new Date().toISOString().split('T')[0],
      booking_time: '10:00',
      status: 'pendente',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (bk) => {
    const d = new Date(bk.booking_date);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().slice(0,5);

    setSelectedBooking(bk);
    setFormData({
      client_id: bk.client?.id || '',
      service_id: bk.service?.id || '',
      team_member_id: bk.team?.id || '',
      booking_date: dateStr,
      booking_time: timeStr,
      status: bk.status,
      notes: bk.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.client_id || !formData.service_id) return alert('Selecione Cliente e Serviço');

    const dt = new Date(`${formData.booking_date}T${formData.booking_time}:00`);

    const payload = {
      client_id: formData.client_id,
      service_id: formData.service_id,
      team_member_id: formData.team_member_id || null,
      booking_date: dt.toISOString(),
      status: formData.status,
      notes: formData.notes
    };

    try {
      if (selectedBooking) {
        const { error } = await supabase.from('bookings').update(payload).eq('id', selectedBooking.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('bookings').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchBookings();
    } catch (e) {
      console.error(e);
      alert('Erro ao gravar marcação.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      fetchBookings();
      setIsModalOpen(false); 
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar estado.');
    }
  };


  const kpis = {
    pendente: bookings.filter(b => b.status === 'pendente').length,
    emAndamento: bookings.filter(b => b.status === 'em_andamento').length,
    concluidos: bookings.filter(b => b.status === 'concluido').length,
    cancelados: bookings.filter(b => b.status === 'cancelado').length,
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  };

  const nowInHours = now.getHours() + now.getMinutes() / 60;
  const showTimeIndicator = nowInHours >= 9 && nowInHours <= 20;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 flex flex-col h-[calc(100vh-140px)]">
      
      {/* Header & Elite Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 animate-fade-in">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <CalendarDays size={12} />
              Gestão de Tempo Elite
            </span>
          </div>
          <h2 className="font-serif text-5xl font-bold text-white tracking-tighter leading-none mb-2">
            Agenda <span className="text-primary italic font-normal">Privada</span>
          </h2>
          <p className="text-muted mt-6 text-lg max-w-2xl font-medium leading-relaxed">
            Consulte a disponibilidade da equipa e garanta a melhor experiência para cada cliente.
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 shadow-inner-premium">
            <button onClick={prevWeek} className="p-3 hover:bg-white/5 rounded-xl transition-all text-muted hover:text-primary"><ChevronLeft size={20} /></button>
            <div className="flex flex-col items-center px-6 min-w-[180px]">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">{formatMonth(weekDays[0])}</span>
               <span className="text-sm font-bold text-white">Semana {weekDays[0].getDate()} - {weekDays[5].getDate()}</span>
            </div>
            <button onClick={nextWeek} className="p-3 hover:bg-white/5 rounded-xl transition-all text-muted hover:text-primary"><ChevronRight size={20} /></button>
          </div>
          <button onClick={goToToday} className="btn-dark !py-4 !px-8 text-[10px] font-black uppercase tracking-widest">Hoje</button>
          <button onClick={openAddModal} className="btn-primary hover:shadow-primary/40 flex items-center gap-3">
            <Plus size={16} /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* Premium KPI Grid */}
      <div className="grid grid-cols-4 gap-8 shrink-0">
         {[
           { icon: <Clock />, val: kpis.pendente, label: 'Pendentes', color: 'primary' },
           { icon: <Anchor />, val: kpis.emAndamento, label: 'Em Curso', color: 'blue-400' },
           { icon: <CheckCircle />, val: kpis.concluidos, label: 'Finalizados', color: 'emerald-400' },
           { icon: <XCircle />, val: kpis.cancelados, label: 'Anulados', color: 'red-400' }
         ].map((k, i) => (
            <div key={i} className="glass-card p-6 flex items-center gap-5 group hover:scale-[1.05] transition-all duration-500">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${k.color === 'primary' ? 'primary' : 'white'}/10 text-${k.color === 'primary' ? 'primary' : 'white'} group-hover:bg-primary/20 transition-colors`}>
                {React.cloneElement(k.icon, { size: 24 })}
              </div>
              <div>
                 <div className="text-3xl font-serif font-bold text-white tracking-tighter">{k.val}</div>
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{k.label}</div>
              </div>
            </div>
         ))}
      </div>

      {/* Calendar Grid wrapper - Elite Glass Effect */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col min-h-0 relative group/calendar border-white/5 bg-white/[0.01]">
        {loading && (
          <div className="absolute inset-0 bg-secondary/60 z-50 flex items-center justify-center backdrop-blur-md">
             <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin shadow-2xl shadow-primary/20"></div>
                <div className="text-primary font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">Sincronização de Elite</div>
             </div>
          </div>
        )}
 
        {/* Calendar Day Headers */}
        <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-white/5 bg-white/[0.02] shrink-0">
          <div className="p-6 flex items-center justify-center border-r border-white/5">
            <CalendarIcon size={20} className="text-muted" />
          </div>
          {daysOfWeek.map((day, i) => {
            const dateObj = weekDays[i];
            const isToday = dateObj.toDateString() === new Date().toDateString();
            return (
               <div key={day} className={`py-6 text-center border-r border-white/5 flex flex-col justify-center relative transition-colors ${isToday ? 'bg-primary/5' : ''}`}>
                 <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isToday ? 'text-primary' : 'text-muted/60'}`}>{day}</span>
                 <div className="flex items-center justify-center mt-3">
                    <span className={`w-10 h-10 flex items-center justify-center rounded-2xl text-xl font-serif transition-all duration-500 ${isToday ? 'bg-primary text-white shadow-2xl shadow-primary/40 font-bold scale-110' : 'text-white/80 group-hover:text-white'}`}>
                       {dateObj.getDate()}
                    </span>
                 </div>
                 {isToday && <motion.div layoutId="today-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-primary shadow-lg shadow-primary/40" />}
               </div>
            )
          })}
        </div>

        {/* Grid Body */}
        <div className="flex-1 overflow-y-auto relative scrollbar-hide bg-white/[0.01]">
          <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr_1fr] grid-rows-[repeat(11,minmax(120px,auto))] min-w-[1000px]">
            {/* Time Slots Labels */}
            {hours.map((h, rIdx) => (
              <React.Fragment key={`row-${rIdx}`}>
                <div className="border-b border-r border-white/5 flex items-start justify-center pt-4 text-[11px] font-black tracking-widest text-muted/40 bg-secondary/50 sticky left-0 z-20 backdrop-blur-md">
                  {h}:00
                </div>
                {/* Column dividers and backgrounds */}
                {Array.from({ length: 6 }).map((_, cIdx) => (
                  <div key={`cell-${rIdx}-${cIdx}`} className={`border-b border-r border-white/5 relative transition-colors duration-500 ${weekDays[cIdx].toDateString() === new Date().toDateString() ? 'bg-primary/[0.02]' : 'hover:bg-white/[0.02]'}`}>
                  </div>
                ))}
              </React.Fragment>
            ))}
 
            {/* Time Indicator Line */}
            {showTimeIndicator && (
              <div 
                className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" 
                style={{ top: `${(nowInHours - 9) * 120}px` }}
              >
                 <div className="w-[100px] pr-4 text-right">
                    <span className="bg-primary text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-2xl shadow-primary/40">
                       {now.toTimeString().slice(0, 5)}
                    </span>
                 </div>
                 <div className="flex-1 h-[2px] bg-primary/30 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/40 border-4 border-secondary" />
                 </div>
              </div>
            )}

            {/* Bookings Overlay - Elite Glass Cards */}
            <div className="absolute inset-0 grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr_1fr] grid-rows-[repeat(11,120px)] pointer-events-none min-w-[1000px]">
               <div className="col-start-1" /> {/* Spacer for time column */}
               {bookings.map(apt => {
                  const bDate = new Date(apt.booking_date);
                  const dayIdx = bDate.getDay() === 0 ? 6 : bDate.getDay() - 1; 
                  if (dayIdx < 0 || dayIdx > 5) return null;
 
                  const startHourNum = bDate.getHours() + (bDate.getMinutes() / 60);
                  const durationHours = (apt.service?.duration || 60) / 60;
                  const startOffset = (startHourNum - 9) * 120;
                  const height = durationHours * 120 - 8; 
 
                  if (startHourNum < 9 || startHourNum > 19) return null;
 
                  return (
                    <motion.div 
                      key={apt.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={(e) => { e.stopPropagation(); openEditModal(apt); }}
                      className={`absolute inset-x-0 mx-3 p-4 rounded-[24px] border border-white/10 shadow-2xl cursor-pointer hover:scale-[1.03] transition-all group pointer-events-auto overflow-hidden bg-white/5 backdrop-blur-md hover:bg-white/10 ${
                        apt.status === 'cancelado' ? 'opacity-40 grayscale border-dashed' : ''
                      }`}
                      style={{
                        gridColumn: dayIdx + 2,
                        top: `${startOffset + 4}px`,
                        height: `${height}px`,
                        zIndex: 10
                      }}
                    >
                      <div className="flex flex-col h-full relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-serif text-sm font-bold text-white tracking-tight">{apt.client?.name || 'Cliente Elite'}</span>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.15em] text-primary mb-2 line-clamp-1">{apt.service?.name}</div>
                        
                        <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
                           <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.2em] text-muted">
                              <Clock size={12} className="text-primary" /> {bDate.toTimeString().slice(0,5)}
                           </div>
                           {apt.team?.name && (
                             <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[8px] font-black uppercase text-primary transition-colors group-hover:bg-primary/20">
                                {apt.team.name.split(' ')[0]}
                             </div>
                           )}
                        </div>
                      </div>
 
                      {/* Left accent bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 shadow-[2px_0_10px_rgba(0,0,0,0.5)] ${
                        apt.status === 'concluido' ? 'bg-emerald-400' : 
                        apt.status === 'em_andamento' ? 'bg-blue-400' : 
                        apt.status === 'cancelado' ? 'bg-muted' : 'bg-primary'
                      }`} />
                    </motion.div>
                  );
               })}
            </div>
          </div>
        </div>
      </div>

      {/* CRUD / View Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-card rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl border border-border-main">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h3 className="font-serif text-4xl text-white tracking-tighter">
                    {selectedBooking ? 'Ficha de' : 'Nova'} <i className="text-primary italic font-normal">Reserva</i>
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] text-muted uppercase tracking-[0.3em] font-black">Elite Diamond Service</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all duration-500 group">
                  <X size={20} className="text-muted group-hover:text-white transition-colors" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-10 max-h-[75vh] overflow-y-auto scrollbar-hide">
                 {selectedBooking && (
                    <div className="grid grid-cols-3 gap-3 p-2 bg-white/[0.02] rounded-[24px] border border-white/5">
                       <button type="button" onClick={() => updateStatus(selectedBooking.id, 'em_andamento')} className="flex flex-col items-center gap-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500/10 text-blue-400 transition-all border border-transparent hover:border-blue-500/20">
                         <Anchor size={14} /> Iniciar
                       </button>
                       <button type="button" onClick={() => updateStatus(selectedBooking.id, 'concluido')} className="flex flex-col items-center gap-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500/10 text-emerald-400 transition-all border border-transparent hover:border-emerald-500/20">
                         <CheckCircle size={14} /> Finalizar
                       </button>
                       <button type="button" onClick={() => updateStatus(selectedBooking.id, 'cancelado')} className="flex flex-col items-center gap-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-500/10 text-red-400 transition-all border border-transparent hover:border-red-500/20">
                         <XCircle size={14} /> Anular
                       </button>
                    </div>
                 )}

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                       <User size={14} /> Cliente VIP
                    </label>
                    <select required value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="luxury-input !py-5">
                      <option value="" disabled className="bg-secondary">Selecionar do Portfólio</option>
                      {clients.map(c => <option key={c.id} value={c.id} className="bg-secondary">{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-4 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                       <Sparkles size={14} /> Ritual de Beleza
                    </label>
                    <select required value={formData.service_id} onChange={e => setFormData({...formData, service_id: e.target.value})} className="luxury-input !py-5">
                      <option value="" disabled className="bg-secondary">Selecionar Experiência</option>
                      {services.map(s => <option key={s.id} value={s.id} className="bg-secondary">{s.name} &middot; {s.duration}min &middot; {s.price}€</option>)}
                    </select>
                  </div>

                  <div className="space-y-4 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                       <Scissors size={14} /> Artista Designada
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {team.map((pro) => (
                        <button
                          key={pro.id}
                          type="button"
                          onClick={() => setFormData({...formData, team_member_id: pro.id})}
                          className={`flex items-center gap-4 p-4 rounded-3xl border transition-all duration-500 text-left relative overflow-hidden group/pro ${formData.team_member_id === pro.id ? 'bg-primary/10 border-primary shadow-2xl shadow-primary/20' : 'bg-white/[0.02] border-white/5 hover:border-primary/40'}`}
                        >
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shadow-lg flex-shrink-0 grayscale group-hover/pro:grayscale-0 transition-all duration-700">
                            <img src={pro.photo_url} alt={pro.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white group-hover/pro:text-primary transition-colors">{pro.name}</p>
                            <p className="text-[9px] text-muted uppercase tracking-widest mt-1 font-black">{pro.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                       <CalendarIcon size={14} /> Data
                    </label>
                    <input required type="date" value={formData.booking_date} onChange={e => setFormData({...formData, booking_date: e.target.value})} className="luxury-input" />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                       <Clock size={14} /> Horário
                    </label>
                    <input required type="time" value={formData.booking_time} onChange={e => setFormData({...formData, booking_time: e.target.value})} className="luxury-input" />
                  </div>

                  <div className="space-y-4 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary block">Notas Particulares</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="luxury-input h-32 resize-none" placeholder="Especificações técnicas, preferências ou observações da cliente..."></textarea>
                  </div>
                </div>

                <div className="pt-10 flex justify-end gap-6 items-center">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-[0.3em] text-muted hover:text-white transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary !px-12 !py-5 shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
                    {selectedBooking ? 'Atualizar Reserva' : 'Confirmar Reserva Elite'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminBookings;
