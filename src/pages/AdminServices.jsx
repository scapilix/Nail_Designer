import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Plus, Search, Settings2, Edit2, Trash2, Clock, Euro, Sparkles, Scissors, Droplets, X, Save
} from 'lucide-react';

const AdminServices = () => {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Nails', price: '', duration: '', description: '' });

  const categories = ['Todos', 'Nails', 'Feet', 'Design'];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('services').select('*').order('name');
      if (error) throw error;
      setServices(data || []);
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar serviços.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Tem a certeza que deseja apagar este serviço?')) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      fetchServices();
    } catch (e) {
      console.error(e);
      alert('Erro ao apagar serviço.');
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditId(service.id);
      setFormData({
        name: service.name,
        category: service.category || 'Nails',
        price: service.price,
        duration: service.duration,
        description: service.description || ''
      });
    } else {
      setEditId(null);
      setFormData({ name: '', category: 'Nails', price: '', duration: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        duration: Number(formData.duration),
        description: formData.description
      };

      if (editId) {
        const { error } = await supabase.from('services').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (e) {
      console.error(e);
      alert('Erro ao guardar serviço.');
    }
  };

  const getIcon = (cat) => {
    switch (cat) {
      case 'Nails': return <Scissors className="w-5 h-5" />;
      case 'Feet': return <Droplets className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const filteredServices = services.filter(s => {
    if (filter !== 'Todos' && s.category !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-4xl mb-2 text-main">Gestão de <i className="text-primary italic font-normal">Serviços</i></h2>
          <p className="text-muted text-sm">Adicione, edite ou remova os seus serviços de luxo.</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary text-white hover:bg-primary-light px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Serviço
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-card p-4 rounded-[32px] border border-border-main shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-main p-1.5 rounded-2xl w-full md:w-auto border border-border-main/50">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                filter === cat 
                  ? 'bg-card text-main shadow-lg border border-border-main' 
                  : 'text-muted hover:text-main'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-main px-4 py-3 rounded-2xl w-full md:w-[300px] border border-border-main">
            <Search className="w-4 h-4 text-muted" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Procurar serviço..." 
              className="bg-transparent border-none outline-none text-sm w-full text-main placeholder:text-muted" 
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-20 text-muted">Carregando Serviços do Banco de Dados...</div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-20 text-muted">Nenhum serviço encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredServices.map(service => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={service.id}
                className="group bg-card rounded-[32px] p-8 border border-border-main shadow-sm hover:bg-main/50 hover:border-primary/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-main border border-border-main flex items-center justify-center text-muted group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      {getIcon(service.category)}
                    </div>
                    <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                      Disponível
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-xl text-main mb-2">{service.name}</h3>
                  <p className="text-sm text-muted mb-6 line-clamp-2">{service.description || 'Sem descrição.'}</p>
                  
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-main bg-main border border-border-main px-3 py-1.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {service.duration}m
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted">
                      <span className="text-primary font-black">/</span> {service.category}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border-main/50 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted mb-1">Preço Base</div>
                    <div className="flex items-center font-serif text-3xl text-main">
                      {Number(service.price).toFixed(2)}
                      <Euro className="w-5 h-5 text-primary ml-1" />
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 relative z-10">
                    <button onClick={() => openModal(service)} className="p-2.5 bg-main border border-border-main text-muted hover:text-main hover:bg-card rounded-xl transition-all cursor-pointer">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="p-2.5 bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all cursor-pointer border border-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-card border border-border-main rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-border-main/50 flex justify-between items-center bg-main/50">
                <h3 className="font-serif text-3xl text-main">{editId ? 'Editar' : 'Novo'} <i className="text-primary italic font-normal">Serviço</i></h3>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-card border border-border-main rounded-full hover:bg-main transition-colors">
                  <X className="w-5 h-5 text-muted hover:text-main" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Nome do Serviço</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-main border border-border-main rounded-xl px-5 py-4 text-sm outline-none text-main focus:ring-1 focus:ring-primary" placeholder="Ex: Manicure Francesa" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Preço (€)</label>
                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-main border border-border-main rounded-xl px-5 py-4 text-sm outline-none text-main focus:ring-1 focus:ring-primary" placeholder="0.00" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Duração (Minutos)</label>
                    <input required type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-main border border-border-main rounded-xl px-5 py-4 text-sm outline-none text-main focus:ring-1 focus:ring-primary" placeholder="60" />
                  </div>

                  <div className="space-y-3 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Categoria</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-main border border-border-main rounded-xl px-5 py-4 text-sm outline-none text-main focus:ring-1 focus:ring-primary">
                      {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c} className="bg-card">{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Pequena Descrição</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-main border border-border-main rounded-xl px-5 py-4 text-sm outline-none text-main focus:ring-1 focus:ring-primary h-28 resize-none placeholder:text-muted" placeholder="Detalhes maravilhosos sobre o serviço..."></textarea>
                  </div>
                </div>

                <div className="pt-8 flex justify-end gap-4 border-t border-border-main/50">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-muted hover:text-main transition-colors">
                    Descartar
                  </button>
                  <button type="submit" className="bg-primary text-white hover:bg-primary-light px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Guardar Alterações
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

export default AdminServices;
