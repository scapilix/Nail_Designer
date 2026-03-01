import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, Plus, X, Edit, Trash2, Search, Phone, Mail, Briefcase } from 'lucide-react';

const AdminTeam = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: '', phone: '', email: '', commission_rate: 0 });

  const fetchData = async () => { setLoading(true); const { data } = await supabase.from('team_members').select('*').order('name'); setMembers(data || []); setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (selected) { await supabase.from('team_members').update(formData).eq('id', selected.id); }
    else { await supabase.from('team_members').insert([formData]); }
    setIsModalOpen(false); setSelected(null); fetchData();
  };

  const handleDelete = async (id) => { if (!confirm('Apagar?')) return; await supabase.from('team_members').delete().eq('id', id); fetchData(); };
  const openNew = () => { setSelected(null); setFormData({ name: '', role: '', phone: '', email: '', commission_rate: 0 }); setIsModalOpen(true); };
  const openEdit = (m) => { setSelected(m); setFormData({ name: m.name||'', role: m.role||'', phone: m.phone||'', email: m.email||'', commission_rate: m.commission_rate||0 }); setIsModalOpen(true); };
  const filtered = members.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Profissionais</h1><p className="text-muted text-sm mt-1">Equipa do salão</p></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Profissional</button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-border-main px-4 py-2.5 rounded-lg">
        <Search className="w-4 h-4 text-muted" />
        <input type="text" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="card p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">{m.name?.charAt(0)}</div>
                  )}
                <div>
                  <h3 className="font-semibold text-dark">{m.name}</h3>
                  <span className="badge badge-info">{m.role || 'Profissional'}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(m)} className="p-1.5 rounded hover:bg-slate-100 text-muted hover:text-blue-600"><Edit size={14} /></button>
                <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted">
              {m.phone && <div className="flex items-center gap-2"><Phone size={13} />{m.phone}</div>}
              {m.email && <div className="flex items-center gap-2"><Mail size={13} />{m.email}</div>}
              <div className="flex items-center gap-2"><Briefcase size={13} />Comissão: {m.commission_rate || 0}%</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-3 card p-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhum profissional'}</div>}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main">
                  <h2 className="text-lg font-bold text-dark">{selected ? 'Editar' : 'Novo'} Profissional</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Nome *</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="luxury-input" /></div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Função</label><input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="luxury-input" placeholder="Ex: Nail Designer, Esteticista..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Telefone</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="luxury-input" /></div>
                  </div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Taxa de Comissão (%)</label><input type="number" value={formData.commission_rate} onChange={e => setFormData({...formData, commission_rate: Number(e.target.value)})} className="luxury-input" /></div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-border-main bg-slate-50 rounded-b-2xl">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                  <button type="submit" className="btn-primary">Guardar</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTeam;
