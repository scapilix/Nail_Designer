import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, User, Clock, ChevronRight, Check, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Scheduling = () => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableProId, setAvailableProId] = useState('');
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  
  const [team, setTeam] = useState([]);
  const [services, setServices] = useState([]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i <= 20; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
      if (i !== 20) {
        slots.push(`${String(i).padStart(2, '0')}:30`);
      }
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    const fetchTeamAndServices = async () => {
      try {
        const [teamRes, servicesRes] = await Promise.all([
          supabase.from('team').select('*').order('name'),
          supabase.from('services').select('*').order('name')
        ]);
        
        if (teamRes.error) throw teamRes.error;
        if (servicesRes.error) throw servicesRes.error;
        
        setTeam(teamRes.data || []);
        setServices(servicesRes.data || []);
      } catch (err) {
        console.error('Error fetching data for scheduling:', err);
      }
    };
    fetchTeamAndServices();
  }, []);

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!selectedService || !bookingDate || !bookingTime) {
      setStatusMessage({ type: 'error', text: 'Selecione o serviço, data e hora.' });
      return;
    }

    if (!bookingTime.endsWith('00') && !bookingTime.endsWith('30')) {
      setStatusMessage({ type: 'error', text: 'Os horários devem ser à hora certa ou meia hora (ex: 10:00 ou 10:30).' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: '', text: '' });
    setSuggestedSlots([]);

    try {
      const dayStart = new Date(`${bookingDate}T00:00:00`).toISOString();
      const dayEnd = new Date(`${bookingDate}T23:59:59`).toISOString();
      const desiredTime = new Date(`${bookingDate}T${bookingTime}:00`).getTime();

      let assignedProId = selectedProfessional;

      if (selectedProfessional) {
        const { data: dayBookings, error: dayErr } = await supabase
          .from('bookings')
          .select('booking_date')
          .eq('team_member_id', selectedProfessional)
          .gte('booking_date', dayStart)
          .lte('booking_date', dayEnd)
          .neq('status', 'cancelado');
          
        if (dayErr) throw dayErr;
        
        const bookedTimes = dayBookings.map(b => new Date(b.booking_date).getTime());
        
        if (bookedTimes.includes(desiredTime)) {
          const suggestions = [];
          const offsets = [-60, -30, 30, 60];
          for (let offset of offsets) {
             const timeToCheck = desiredTime + (offset * 60 * 1000);
             if (!bookedTimes.includes(timeToCheck)) {
                const d = new Date(timeToCheck);
                const hh = d.getHours();
                if (hh >= 9 && hh <= 20) {
                   const hhStr = String(hh).padStart(2, '0');
                   const mmStr = String(d.getMinutes()).padStart(2, '0');
                   suggestions.push(`${hhStr}:${mmStr}`);
                }
             }
          }
          
          setSuggestedSlots(suggestions);
          setStatusMessage({ type: 'error', text: 'Desculpe, a profissional selecionada já tem marcação nesse horário. Que tal uma destas opções?' });
          setIsSubmitting(false);
          return;
        }
      } else {
        const { data: dayBookings, error: dayErr } = await supabase
          .from('bookings')
          .select('team_member_id, booking_date')
          .gte('booking_date', dayStart)
          .lte('booking_date', dayEnd)
          .neq('status', 'cancelado');
          
        if (dayErr) throw dayErr;

        const bookingsByTime = {};
        dayBookings.forEach(b => {
          const t = new Date(b.booking_date).getTime();
          if (!bookingsByTime[t]) bookingsByTime[t] = [];
          bookingsByTime[t].push(b.team_member_id);
        });

        const busyProsAtDesiredTime = bookingsByTime[desiredTime] || [];
        const freePro = team.find(p => !busyProsAtDesiredTime.includes(p.id));

        if (!freePro) {
          const suggestions = [];
          const offsets = [-60, -30, 30, 60];
          for (let offset of offsets) {
            const timeToCheck = desiredTime + (offset * 60 * 1000);
            const busyProsAtTime = bookingsByTime[timeToCheck] || [];
            if (team.some(p => !busyProsAtTime.includes(p.id))) {
              const d = new Date(timeToCheck);
              const hh = d.getHours();
              if (hh >= 9 && hh <= 20) {
                 const hhStr = String(hh).padStart(2, '0');
                 const mmStr = String(d.getMinutes()).padStart(2, '0');
                 suggestions.push(`${hhStr}:${mmStr}`);
              }
            }
          }

          setSuggestedSlots(suggestions);
          setStatusMessage({ type: 'error', text: 'Desculpe, não temos profissionais disponíveis nesse horário. Que tal uma destas opções?' });
          setIsSubmitting(false);
          return;
        }
        
        assignedProId = freePro.id;
      }

      setAvailableProId(assignedProId);
      setIsModalOpen(true);
      
    } catch (error) {
      console.error('Error checking availability:', error);
      setStatusMessage({ type: 'error', text: 'Ocorreu um erro ao verificar disponibilidade.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
        setStatusMessage({ type: 'error', text: 'Preencha o seu nome e telemóvel.' });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dtIso = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();
      
      let clientId;
      const { data: existingClients, error: clientErr } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', clientPhone)
        .limit(1);

      if (clientErr) throw clientErr;

      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
      } else {
        const { data: newClient, error: newClientErr } = await supabase
          .from('clients')
          .insert([{ name: clientName, email: clientEmail, phone: clientPhone }])
          .select('id')
          .single();
          
        if (newClientErr) throw newClientErr;
        clientId = newClient.id;
      }

      const { error: bookingErr } = await supabase
        .from('bookings')
        .insert([{
          client_id: clientId,
          service_id: selectedService,
          team_member_id: availableProId,
          booking_date: dtIso,
          status: 'pendente'
        }]);

      if (bookingErr) throw bookingErr;

      setStatusMessage({ type: 'success', text: 'Reserva efetuada com sucesso! Aguarde a nossa confirmação.' });
      
      setTimeout(() => {
          setIsModalOpen(false);
          setClientName('');
          setClientPhone('');
          setClientEmail('');
          setSelectedService('');
          setSelectedProfessional('');
          setBookingDate('');
          setBookingTime('');
          setStatusMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      setStatusMessage({ type: 'error', text: 'Ocorreu um erro ao processar a reserva. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section id="agendamento" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row bg-dark rounded-[32px] overflow-hidden shadow-2xl">
          {/* Left Side - Info */}
          <div className="lg:w-2/5 p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase mb-6 block">Agendamento Online</span>
              <h2 className="font-serif text-4xl mb-8 leading-tight">
                Reserve o seu <br />
                <i className="text-primary font-normal italic">Momento de Exclusividade</i>
              </h2>
              <p className="text-gray-400 font-light mb-12 leading-relaxed">
                Escolha o serviço desejado e a sua profissional de eleição. O luxo começa na ponta dos seus dedos.
              </p>
              
              <div className="space-y-8">
                {[
                  { icon: <User className="w-5 h-5" />, title: 'Escolha Profissional', desc: 'Sinta-se à vontade com a sua especialista favorita.' },
                  { icon: <Clock className="w-5 h-5" />, title: 'Disponibilidade Real', desc: 'Verifique horários atualizados em tempo real.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 bg-secondary p-12 lg:p-16">
            <form onSubmit={handleCheckAvailability} className="space-y-8">
              {statusMessage.text && !isModalOpen && (
                <div className={`p-4 rounded-xl text-sm font-bold border ${statusMessage.type === 'error' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                  {statusMessage.text}
                  {suggestedSlots.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                       {suggestedSlots.map(slot => (
                          <button 
                            key={slot}
                            type="button"
                            onClick={() => {
                               setBookingTime(slot);
                               setSuggestedSlots([]);
                               setStatusMessage({ type: '', text: '' });
                            }}
                            className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm text-xs tracking-wider"
                          >
                            {slot}
                          </button>
                       ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3 col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-dark block">Serviço Especializado</label>
                  <select 
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-custom px-4 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.duration}min / {s.price}€)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-dark block">Escolha a sua Profissional</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedProfessional('')}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${!selectedProfessional ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-dark">Qualquer uma</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Disponível agora</p>
                      </div>
                    </button>

                    {team.map((pro) => (
                      <button
                        key={pro.id}
                        type="button"
                        onClick={() => setSelectedProfessional(pro.id)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left relative overflow-hidden ${selectedProfessional === pro.id ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-gray-100">
                          <img src={pro.photo_url || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop'} alt={pro.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-dark truncate">{pro.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate">{pro.role}</p>
                        </div>
                        {selectedProfessional === pro.id && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-dark block">Data Preferencial</label>
                  <div className="relative">
                    <input 
                      required
                      type="date" 
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-custom px-4 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm pl-12"
                    />
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-dark block">Horário</label>
                  <div className="relative">
                    <select 
                      required
                      value={bookingTime}
                      onChange={e => setBookingTime(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-custom px-4 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm pl-12 appearance-none"
                    >
                      <option value="" disabled hidden>Selecione a hora</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-dark text-white font-bold py-5 rounded-custom hover:bg-primary transition-all duration-500 shadow-xl flex items-center justify-center gap-3 group uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'A Verificar...' : 'Verificar Disponibilidade'}
                  {!isSubmitting && <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
                </button>
              </div>

              
              <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
                Confirmação instantânea via SMS & Email.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-secondary/30">
                <div>
                   <h3 className="font-serif text-2xl text-dark">Quase <i className="text-primary italic font-normal">Lá!</i></h3>
                   <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Horário Disponível</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleConfirmBooking} className="p-8 space-y-6">
                
                {statusMessage.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold border ${statusMessage.type === 'error' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                    {statusMessage.text}
                  </div>
                )}
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-6">Por favor, insira os seus dados para confirmar a marcação no dia <strong className="text-dark">{new Date(bookingDate).toLocaleDateString('pt-PT')}</strong> às <strong className="text-dark">{bookingTime}</strong>.</p>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-primary">Nome Completo</label>
                     <input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="O seu nome" />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-primary">Telemóvel</label>
                     <input required type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="+351 900 000 000" />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-primary">Email (Opcional)</label>
                     <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="O seu melhor email" />
                  </div>
                </div>

                <div className="pt-6">
                  {statusMessage.type !== 'success' && (
                     <button 
                       type="submit" 
                       disabled={isSubmitting}
                       className="w-full btn-primary flex items-center justify-center gap-2 py-4 shadow-xl shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                       {isSubmitting ? 'A Confirmar...' : <><CheckCircle className="w-5 h-5" /> Confirmar Marcação</>}
                     </button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Scheduling;
