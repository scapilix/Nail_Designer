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
      supabase.from('team').select('id, name').order('name')
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
          team:team_member_id(id, name)
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'concluido': return 'bg-green-50 border-green-100 text-green-700';
      case 'em_andamento': return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'pendente': return 'bg-primary/10 border-primary/20 text-dark';
      case 'cancelado': return 'bg-red-50 border-red-100 text-red-500 opacity-60';
      default: return 'bg-gray-100 border-gray-200 text-gray-500';
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

  // Time indicator position helper
  const nowInHours = now.getHours() + now.getMinutes() / 60;
  const showTimeIndicator = nowInHours >= 9 && nowInHours <= 20;
  const timeIndicatorTop = (nowInHours - 9) * 100; // grid cells are 100px high now for better feel

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      
      {/* Header & Month controls */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h2 className="font-serif text-4xl mb-2">Agenda de <i className="text-primary italic font-normal">Marcações</i></h2>
          <p className="text-gray-400 text-sm">Gerencie o tempo e a experiência das suas clientes num calendário unificado.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-4 bg-white rounded-[20px] border border-gray-100 p-2 shadow-sm">
            <button onClick={prevWeek} className="p-2 hover:bg-secondary rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
            <div className="flex items-center gap-3 px-2">
               <CalendarDays className="w-4 h-4 text-primary" />
               <span className="text-sm font-bold capitalize min-w-[140px] text-center">{formatMonth(weekDays[0])}</span>
            </div>
            <button onClick={nextWeek} className="p-2 hover:bg-secondary rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
          </div>
          <button onClick={goToToday} className="px-6 py-2 bg-secondary text-dark rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-sm">Hoje</button>
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
         {[
           { icon: <Clock />, val: kpis.pendente, label: 'Pendentes', color: 'bg-primary/20 text-primary' },
           { icon: <Anchor />, val: kpis.emAndamento, label: 'Em Andamento', color: 'bg-blue-50 text-blue-500' },
           { icon: <CheckCircle />, val: kpis.concluidos, label: 'Concluídos', color: 'bg-green-50 text-green-500' },
           { icon: <XCircle />, val: kpis.cancelados, label: 'Cancelados', color: 'bg-red-50 text-red-400' }
         ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${k.color}`}>{React.cloneElement(k.icon, { className: 'w-5 h-5' })}</div>
              <div>
                 <div className="text-2xl font-serif text-dark">{k.val}</div>
                 <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{k.label}</div>
              </div>
            </div>
         ))}
      </div>

      {/* Calendar Grid wrapper */}
      <div className="flex-1 bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col min-h-0 relative group/calendar">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-[2px]">
             <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="text-primary font-bold tracking-widest uppercase text-[10px]">Sincronizando...</div>
             </div>
          </div>
        )}

        {/* Calendar Day Headers */}
        <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="p-4 flex items-center justify-center border-r border-gray-100">
            <CalendarIcon className="w-5 h-5 text-gray-300" />
          </div>
          {daysOfWeek.map((day, i) => {
            const dateObj = weekDays[i];
            const isToday = dateObj.toDateString() === new Date().toDateString();
            return (
               <div key={day} className={`py-4 text-center border-r border-gray-100 flex flex-col justify-center relative ${isToday ? 'bg-primary/5' : ''}`}>
                 <span className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-primary' : 'text-gray-400'}`}>{day}</span>
                 <div className="flex items-center justify-center mt-1">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-lg font-serif transition-colors ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/30 font-bold' : 'text-dark'}`}>
                       {dateObj.getDate()}
                    </span>
                 </div>
                 {isToday && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
               </div>
            )
          })}
        </div>

        {/* Grid Body */}
        <div className="flex-1 overflow-y-auto relative scrollbar-hide">
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr] grid-rows-[repeat(11,minmax(100px,auto))] min-w-[900px]">
            {/* Time Slots Labels */}
            {hours.map((h, rIdx) => (
              <React.Fragment key={`row-${rIdx}`}>
                <div className="border-b border-r border-gray-50 flex items-start justify-center pt-2 text-[11px] font-bold text-gray-300 bg-white sticky left-0 z-20">
                  {h}:00
                </div>
                {/* Column dividers and backgrounds */}
                {Array.from({ length: 6 }).map((_, cIdx) => (
                  <div key={`cell-${rIdx}-${cIdx}`} className={`border-b border-r border-gray-50 relative ${weekDays[cIdx].toDateString() === new Date().toDateString() ? 'bg-primary/[0.015]' : 'bg-white'}`}>
                  </div>
                ))}
              </React.Fragment>
            ))}

            {/* Time Indicator Line */}
            {showTimeIndicator && (
              <div 
                className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" 
                style={{ top: `${timeIndicatorTop}px` }}
              >
                 <div className="w-20 pr-2 text-right">
                    <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                       {now.toTimeString().slice(0, 5)}
                    </span>
                 </div>
                 <div className="flex-1 h-0.5 bg-red-500/40 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 shadow-sm" />
                 </div>
              </div>
            )}

            {/* Bookings Overlay */}
            <div className="absolute inset-0 grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr] grid-rows-[repeat(11,100px)] pointer-events-none min-w-[900px]">
               <div className="col-start-1" /> {/* Spacer for time column */}
               {bookings.map(apt => {
                  const bDate = new Date(apt.booking_date);
                  const dayIdx = bDate.getDay() === 0 ? 6 : bDate.getDay() - 1; // 0=Mon, 5=Sat
                  if (dayIdx < 0 || dayIdx > 5) return null;

                  const startHourNum = bDate.getHours() + (bDate.getMinutes() / 60);
                  const durationHours = (apt.service?.duration || 60) / 60;
                  const startOffset = (startHourNum - 9) * 100;
                  const height = durationHours * 100 - 4; // Padding

                  if (startHourNum < 9 || startHourNum > 19) return null;

                  return (
                    <div 
                      key={apt.id}
                      onClick={(e) => { e.stopPropagation(); openEditModal(apt); }}
                      className={`absolute inset-x-0 mx-2 p-3 rounded-2xl border shadow-sm cursor-pointer hover:shadow-xl hover:scale-[1.03] transition-all group pointer-events-auto overflow-hidden ${getStatusColor(apt.status)}`}
                      style={{
                        gridColumn: dayIdx + 2,
                        top: `${startOffset + 2}px`,
                        height: `${height}px`,
                        zIndex: 10
                      }}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-xs truncate uppercase tracking-tight text-inherit leading-none">{apt.client?.name || 'Sem Cliente'}</span>
                        </div>
                        <div className="text-[10px] font-medium opacity-80 leading-tight line-clamp-2">{apt.service?.name}</div>
                        
                        <div className="mt-auto pt-2 flex items-center justify-between opacity-70">
                           <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase">
                              <Clock className="w-3 h-3" /> {bDate.toTimeString().slice(0,5)}
                           </div>
                           {apt.team?.name && (
                             <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/40 rounded-md text-[8px] font-bold uppercase transition-colors group-hover:bg-white/60">
                                {apt.team.name.split(' ')[0]}
                             </div>
                           )}
                        </div>
                      </div>

                      {/* Side accent based on status */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        apt.status === 'concluido' ? 'bg-green-500' : 
                        apt.status === 'em_andamento' ? 'bg-blue-500' : 
                        apt.status === 'cancelado' ? 'bg-red-400' : 'bg-primary'
                      }`} />
                    </div>
                  );
               })}
            </div>
          </div>
        </div>
      </div>

      {/* CRUD / View Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/70 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100">
              <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-serif text-3xl text-dark">
                    {selectedBooking ? 'Ficha do' : 'Novo'} <i className="text-primary italic font-normal">Agendamento</i>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Gestão Premium de Reservas</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                 {selectedBooking && (
                    <div className="grid grid-cols-3 gap-3 mb-4 p-2 bg-secondary/30 rounded-[24px] border border-gray-100">
                       <button type="button" onClick={() => updateStatus(selectedBooking.id, 'em_andamento')} className="py-3 text-[10px] font-black uppercase tracking-[0.1em] rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">Iniciar</button>
                       <button type="button" onClick={() => updateStatus(selectedBooking.id, 'concluido')} className="py-3 text-[10px] font-black uppercase tracking-[0.1em] rounded-2xl bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all">Concluir</button>
                       <button type="button" onClick={() => updateStatus(selectedBooking.id, 'cancelado')} className="py-3 text-[10px] font-black uppercase tracking-[0.1em] rounded-2xl bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white transition-all">Anular</button>
                    </div>
                 )}

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                       <User className="w-3 h-3" /> Identificação da Cliente
                    </label>
                    <select required value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="w-full bg-secondary/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all">
                      <option value="" disabled>Selecionar Cliente</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                       <Sparkles className="w-3 h-3" /> Serviço a Executar
                    </label>
                    <select required value={formData.service_id} onChange={e => setFormData({...formData, service_id: e.target.value})} className="w-full bg-secondary/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all">
                      <option value="" disabled>Selecionar Serviço</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} &middot; {s.duration}min &middot; {s.price}€</option>)}
                    </select>
                  </div>

                  <div className="space-y-3 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                       <Scissors className="w-3 h-3" /> Profissional Responsável
                    </label>
                    <select value={formData.team_member_id} onChange={e => setFormData({...formData, team_member_id: e.target.value})} className="w-full bg-secondary/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all">
                      <option value="">Atribuição Flexível (Diana Silva)</option>
                      {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                       <CalendarIcon className="w-3 h-3" /> Data
                    </label>
                    <input required type="date" value={formData.booking_date} onChange={e => setFormData({...formData, booking_date: e.target.value})} className="w-full bg-secondary/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                       <Clock className="w-3 h-3" /> Horário
                    </label>
                    <input required type="time" value={formData.booking_time} onChange={e => setFormData({...formData, booking_time: e.target.value})} className="w-full bg-secondary/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white" />
                  </div>

                  <div className="space-y-3 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary block">Informações Adicionais</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-secondary/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white h-24 resize-none transition-all" placeholder="Preferências, alergias ou notas técnicas..."></textarea>
                  </div>
                </div>

                <div className="pt-10 flex justify-end gap-5">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-dark transition-colors">
                    Descartar
                  </button>
                  <button type="submit" className="bg-dark text-white hover:bg-primary px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20">
                    {selectedBooking ? 'Salvar Alterações' : 'Confirmar Reserva'}
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
