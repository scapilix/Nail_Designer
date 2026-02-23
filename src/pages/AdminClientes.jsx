import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, TrendingUp, Calendar, ChevronRight, Plus, X, Edit2, Trash2, Mail, Phone, ShoppingBag, Euro } from 'lucide-react';
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
    <div className="space-y-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="font-serif text-4xl mb-2 text-main">Gestão de <i className="text-primary italic font-normal">Clientes</i></h2>
          <p className="text-muted text-sm font-light">
            Acompanhe o percurso dos seus clientes, analise tendências e construa relações exclusivas.
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-2xl border border-border-main shadow-sm w-full md:w-auto">
            <Search className="w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Pesquisar cliente..."
              className="bg-transparent text-sm w-full md:w-48 outline-none text-main placeholder:text-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Novo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Total de Clientes', value: clients.length, icon: <Users className="w-6 h-6" />, color: 'bg-main border border-border-main' },
          { title: 'Clientes VIP (>100€)', value: clients.filter(c => c.total_spent > 100).length, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-primary' },
          { title: 'Novos Este Mês', value: '+3', icon: <Calendar className="w-6 h-6" />, color: 'bg-main border border-border-main' }, // Static mockup for demo
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-8 rounded-[32px] border border-border-main shadow-sm"
          >
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6`}>
              {stat.icon}
            </div>
            <h4 className="text-muted text-xs font-bold uppercase tracking-[0.2em] mb-2">{stat.title}</h4>
            <div className="text-3xl font-serif font-bold text-main">{stat.value}</div>
          </motion.div>
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

      {/* View Historical Detail Modal */}
      <AnimatePresence>
        {isViewOpen && selectedClient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border border-border-main">
              
              {/* Header Profile */}
              <div className="p-8 bg-main text-main relative border-b border-border-main">
                <button onClick={() => setIsViewOpen(false)} className="absolute top-6 right-6 p-2 bg-card rounded-full hover:bg-main border border-border-main transition-colors text-muted shadow-sm">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold font-serif text-3xl shadow-lg">
                     {selectedClient.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                      <h2 className="text-3xl font-bold mb-1 text-main">{selectedClient.name}</h2>
                      <div className="flex gap-4 text-xs font-medium text-muted">
                         {selectedClient.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {selectedClient.email}</span>}
                         {selectedClient.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {selectedClient.phone}</span>}
                      </div>
                   </div>
                </div>
                
                {/* Actions */}
                <div className="absolute bottom-6 right-6 flex gap-2">
                   <button onClick={() => openForm(selectedClient)} className="p-2.5 bg-card hover:bg-main border border-border-main rounded-xl transition-all cursor-pointer"><Edit2 className="w-4 h-4 text-primary" /></button>
                   <button onClick={() => handleDelete(selectedClient.id)} className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto flex-1 bg-main/30">
                 
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-card p-5 rounded-2xl border border-border-main shadow-sm flex items-center gap-4">
                       <Euro className="w-8 h-8 text-primary" />
                       <div>
                          <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Valor do LTV</p>
                          <p className="text-xl font-serif text-main font-bold">{Number(selectedClient.total_spent).toFixed(2)}€</p>
                       </div>
                    </div>
                    <div className="bg-card p-5 rounded-2xl border border-border-main shadow-sm flex items-center gap-4">
                       <Calendar className="w-8 h-8 text-primary" />
                       <div>
                          <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Última Visita</p>
                          <p className="text-sm font-bold text-main mt-1">
                             {selectedClient.last_visit ? new Date(selectedClient.last_visit).toLocaleDateString() : 'N/A'}
                          </p>
                       </div>
                    </div>
                 </div>

                 <h4 className="text-xs uppercase tracking-widest font-bold text-muted mb-4 px-2">Histórico de Faturas</h4>
                 <div className="space-y-3">
                    {loadingInvoices ? (
                       <p className="text-xs text-muted px-2 italic">A carregar registos...</p>
                    ) : clientInvoices.length > 0 ? (
                       clientInvoices.map(inv => (
                          <div key={inv.id} className="bg-card p-4 rounded-2xl border border-border-main shadow-sm flex justify-between items-center group hover:border-primary transition-colors">
                             <div>
                                <div className="text-sm font-bold text-main mb-1">Fatura #{inv.id.split('-')[0]}</div>
                                <div className="text-[10px] text-muted uppercase tracking-widest">{new Date(inv.issue_date).toLocaleDateString()} &middot; {inv.status}</div>
                             </div>
                             <div className="font-serif text-primary font-bold">{Number(inv.total_amount).toFixed(2)}€</div>
                          </div>
                       ))
                    ) : (
                       <p className="text-xs text-muted px-2 italic">Este cliente ainda não tem faturas registadas.</p>
                    )}
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
