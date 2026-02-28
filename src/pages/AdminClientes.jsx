import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, TrendingUp, Calendar, ChevronRight, Plus, X, Edit2, Trash2, Mail, Phone, ShoppingBag, Euro, Stethoscope, ArrowUpRight, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminClientes = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Selected Client for View
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientInvoices, setClientInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Form
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('total_spent', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientInvoices = async (clientId) => {
    setLoadingInvoices(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('issue_date', { ascending: false });
      
      if (error) throw error;
      setClientInvoices(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const openForm = (client = null) => {
    if (client) {
      setEditId(client.id);
      setForm({ name: client.name, email: client.email || '', phone: client.phone || '' });
    } else {
      setEditId(null);
      setForm({ name: '', email: '', phone: '' });
    }
    setIsFormOpen(true);
  };

  const openView = (client) => {
    setSelectedClient(client);
    setIsViewOpen(true);
    fetchClientInvoices(client.id);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { error } = await supabase.from('clients').update(form).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('clients').insert([form]);
        if (error) throw error;
      }
      setIsFormOpen(false);
      fetchClients();
    } catch (e) {
      console.error(e);
      alert('Erro ao guardar cliente.');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Tem a certeza que deseja apagar este cliente? Todo o seu historial será perdido.')) return;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      setIsViewOpen(false);
      fetchClients();
    } catch (e) {
      console.error(e);
      alert('Erro ao apagar cliente.');
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  const topSpenders = [...clients].sort((a,b) => b.total_spent - a.total_spent).slice(0, 5);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 animate-fade-in">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <Users size={12} />
              Gestão VIP de Clientes
            </span>
          </div>
          <h2 className="font-serif text-5xl font-bold text-white tracking-tighter leading-none mb-2">
            Base de <span className="text-primary italic font-normal">Relacionamento</span>
          </h2>
          <p className="text-muted mt-6 text-lg max-w-2xl font-medium leading-relaxed">
            Consulte o historial completo, fichas de anamnese e preferências de cada cliente para um atendimento personalizado de luxo.
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 shadow-inner-premium w-full md:w-80 group-focus-within:bg-white/10 group-focus-within:border-primary/30 transition-all duration-500">
            <Search className="w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou telemóvel..."
              className="bg-transparent text-sm w-full outline-none text-white placeholder:text-muted/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Novo Registo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Total de Clientes', value: clients.length, icon: <Users />, color: 'primary', trend: '+12.5%' },
          { title: 'Clientes VIP', value: clients.filter(c => c.total_spent > 100).length, icon: <TrendingUp />, color: 'emerald-400', trend: '+8.2%' },
          { title: 'Taxa de Retenção', value: '92%', icon: <Calendar />, color: 'amber-400', trend: '+0.8%' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-10 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl bg-${stat.color === 'primary' ? 'primary' : 'white'}/10 text-${stat.color === 'primary' ? 'primary' : 'white'} group-hover:bg-primary/20 transition-colors duration-500`}>
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-green-400 bg-white/5 px-2 py-1 rounded-full">
                  <ArrowUpRight size={10} />
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-muted font-black text-[10px] uppercase tracking-[0.2em] mb-2">{stat.title}</h3>
              <div className="text-4xl font-serif font-bold text-white tracking-tighter mb-1">
                {stat.value}
              </div>
            </div>
            {/* Decorative Background Icon */}
            <div className="absolute -bottom-4 -right-4 opacity-5 text-primary group-hover:opacity-10 transition-opacity duration-500">
              {React.cloneElement(stat.icon, { size: 100 })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-[32px] border border-border-main shadow-sm overflow-hidden">
        <div className="p-8 border-b border-border-main flex justify-between items-center bg-main/50">
          <h3 className="font-bold text-lg tracking-tight text-main">Livrete de Contactos</h3>
          <span className="text-xs font-bold uppercase tracking-widest text-muted bg-card px-4 py-2 rounded-full border border-border-main shadow-sm">
            {filteredClients.length} Registos
          </span>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-main text-xs uppercase tracking-widest text-muted bg-main/30">
                <th className="p-6 font-bold">Cliente</th>
                <th className="p-6 font-bold">Contacto</th>
                <th className="p-6 font-bold hidden md:table-cell">Última Visita</th>
                <th className="p-6 font-bold text-right">Total Gasto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="4" className="p-8 text-center text-gray-400">A carregar dados dos clientes...</td></tr>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client, index) => (
                  <motion.tr 
                    key={client.id}
                    onClick={() => openView(client)}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                    className="border-b border-border-main/50 hover:bg-primary/5 transition-colors group cursor-pointer"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold font-serif shadow-sm">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-main text-sm inline-flex items-center gap-2">
                             {client.name}
                             {index < 3 && <span className="text-[9px] font-bold uppercase bg-primary py-0.5 px-2 rounded-full text-white tracking-widest">Top Nível</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-medium text-main">{client.phone || '--'}</p>
                      <p className="text-xs text-muted">{client.email || '--'}</p>
                    </td>
                    <td className="p-6 hidden md:table-cell">
                      {client.last_visit ? (
                        <span className="text-sm font-medium text-main flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted" />
                          {new Date(client.last_visit).toLocaleDateString('pt-PT')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted italic">Sem registo</span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <span className="text-lg font-serif font-bold text-primary group-hover:text-primary-light transition-colors">
                        {Number(client.total_spent).toFixed(2)}€
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400 font-light italic">Nenhum cliente encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-card p-8 rounded-[32px] shadow-sm border border-border-main">
            <h3 className="font-serif text-2xl text-main mb-6">Top Clientes <i className="text-primary italic font-normal">(Valor Gasto)</i></h3>
            <div className="space-y-4">
               {topSpenders.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-main rounded-2xl border border-border-main">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-card text-primary flex items-center justify-center font-bold text-xs border border-border-main">#{i+1}</div>
                        <div className="font-bold text-sm text-main">{c.name}</div>
                     </div>
                     <div className="font-serif text-xl text-primary font-bold">{Number(c.total_spent).toFixed(2)}€</div>
                  </div>
               ))}
               {topSpenders.length === 0 && <p className="text-muted text-sm italic">Sem dados suficientes.</p>}
            </div>
         </div>

         <div className="bg-card p-8 rounded-[32px] shadow-sm border border-border-main flex items-center justify-center flex-col text-center">
            <ShoppingBag className="w-12 h-12 text-muted mb-4" />
            <h3 className="font-serif text-2xl text-main mb-2">Análise de Produtos</h3>
            <p className="text-sm text-muted max-w-sm">Esta secção irá processar os itens de faturas para determinar os clientes que compram mais produtos físicos no salão.</p>
         </div>
      </div>

      {/* CRUD Add/Edit Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-card rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-border-main">
              <div className="p-6 border-b border-border-main flex justify-between items-center bg-main/50">
                <h3 className="font-serif text-2xl text-main">{editId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <button onClick={() => setIsFormOpen(false)} className="p-2 bg-main rounded-full hover:bg-card border border-border-main transition-colors">
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Nome do Cliente</label>
                  <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-main" placeholder="Nome Completo" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-main" placeholder="email@exemplo.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Telemóvel</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-main" placeholder="+351 912 345 678" />
                </div>
                
                <div className="pt-6 flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-muted hover:bg-main rounded-xl transition-colors">Cancelar</button>
                  <button type="submit" className="btn-primary text-xs py-3 px-6">Gravar Cliente</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Historical Detail Modal - Elite Version */}
      <AnimatePresence>
        {isViewOpen && selectedClient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-secondary/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="glass-card w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              {/* Premium Header */}
              <div className="p-10 bg-white/5 border-b border-white/5 relative">
                <button onClick={() => setIsViewOpen(false)} className="absolute top-8 right-8 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-muted hover:text-white">
                  <X size={20} />
                </button>
                
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-orange-400 p-1 shadow-2xl shadow-primary/20">
                      <div className="w-full h-full rounded-[22px] bg-secondary flex items-center justify-center font-serif text-4xl font-bold text-primary">
                        {selectedClient.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-secondary rounded-full"></div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                      <Sparkles size={12} />
                      Cliente Diamante
                    </div>
                    <h2 className="text-4xl font-serif font-bold text-white tracking-tighter mb-2">{selectedClient.name}</h2>
                    <div className="flex gap-6 text-xs font-bold text-muted uppercase tracking-widest">
                       {selectedClient.phone && <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5"><Phone size={12} className="text-primary"/> {selectedClient.phone}</span>}
                       {selectedClient.email && <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5"><Mail size={12} className="text-primary"/> {selectedClient.email}</span>}
                    </div>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-10 mt-12 border-b border-white/5">
                  {['info', 'history', 'anamnesis', 'finance'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-primary' : 'text-muted hover:text-white'}`}
                    >
                      {tab === 'info' && 'Informações'}
                      {tab === 'history' && 'Historial'}
                      {tab === 'anamnesis' && 'Anamnese'}
                      {tab === 'finance' && 'Financeiro'}
                      {activeTab === tab && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-lg shadow-primary/40" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-12 bg-white/[0.02]">
                {activeTab === 'info' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in-up">
                    <div className="space-y-8">
                       <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">Detalhes Pessoais</h4>
                       <div className="space-y-6">
                          <div className="flex justify-between border-b border-white/5 pb-4">
                             <span className="text-xs text-muted font-bold uppercase tracking-widest">Data de Nascimento</span>
                             <span className="text-sm text-white font-medium">12/05/1992 (31 anos)</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-4">
                             <span className="text-xs text-muted font-bold uppercase tracking-widest">Profissão</span>
                             <span className="text-sm text-white font-medium">Arquiteta</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-4">
                             <span className="text-xs text-muted font-bold uppercase tracking-widest">Como nos conheceu?</span>
                             <span className="text-sm text-white font-medium">Instagram</span>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-8">
                       <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">Métricas de Fidelidade</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                             <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-2">Visitas Totais</p>
                             <p className="text-3xl font-serif text-primary font-bold">14</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                             <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-2">Total Gasto</p>
                             <p className="text-3xl font-serif text-primary font-bold">{Number(selectedClient.total_spent).toFixed(2)}€</p>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-6 animate-fade-in-up">
                     {loadingInvoices ? (
                        <div className="p-10 text-center animate-pulse text-muted font-bold italic tracking-widest uppercase text-xs">A processar historial de luxo...</div>
                     ) : clientInvoices.length > 0 ? (
                        clientInvoices.map(inv => (
                           <div key={inv.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all duration-500 flex justify-between items-center group">
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center border border-white/5">
                                   <Calendar size={18} className="text-primary"/>
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-white">Serviço de Manicure Russa + Spa</p>
                                   <p className="text-[10px] text-muted font-medium uppercase tracking-widest mt-1">{new Date(inv.issue_date).toLocaleDateString()} &middot; Atendida por Leticia</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <span className="text-xl font-serif font-bold text-primary">{Number(inv.total_amount).toFixed(2)}€</span>
                                <p className="text-[10px] text-muted font-medium uppercase tracking-widest mt-1">Fatura Paga</p>
                             </div>
                           </div>
                        ))
                     ) : (
                        <div className="p-20 text-center glass-card border-dashed">
                           <Calendar size={40} className="mx-auto text-muted/20 mb-4" />
                           <p className="text-muted text-sm italic font-medium">Ainda não existem registos de visitas anteriores.</p>
                        </div>
                     )}
                  </div>
                )}

                {activeTab === 'anamnesis' && (
                  <div className="glass-card p-10 space-y-10 animate-fade-in-up border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="text-2xl font-serif font-bold text-white flex items-center gap-4">
                           <Stethoscope className="text-primary" />
                           Ficha de Anamnese Digital
                        </h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Última atualização: 14 Jan 2026</span>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                           <p className="text-xs text-muted font-bold uppercase tracking-widest mb-4">Condições de Saúde</p>
                           <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                              <span className="text-sm text-white/80">Diabetes</span>
                              <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-3 py-1 rounded-full">Não</span>
                           </div>
                           <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                              <span className="text-sm text-white/80">Alergias</span>
                              <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-3 py-1 rounded-full">Nenhuma</span>
                           </div>
                        </div>
                        <div className="space-y-6">
                           <p className="text-xs text-muted font-bold uppercase tracking-widest mb-4">Observações Técnicas</p>
                           <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-sm text-muted leading-relaxed font-medium italic">
                              "Cliente possui lâminas finas e sensíveis. Evitar uso de fresas de alta abrasividade. Prefere formato amêndoa longo."
                           </div>
                        </div>
                     </div>
                  </div>
                )}
              </div>

              {/* Premium Footer Actions */}
              <div className="p-8 bg-white/5 border-t border-white/5 flex justify-between items-center">
                 <button onClick={() => handleDelete(selectedClient.id)} className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                    <Trash2 size={12}/> Eliminar Registo permanente
                 </button>
                 <div className="flex gap-4">
                    <button onClick={() => openForm(selectedClient)} className="btn-dark !py-3 !px-6 text-xs">Editar Cadastro</button>
                    <button className="btn-primary !py-3 !px-8 text-xs">Novo Agendamento</button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminClientes;
