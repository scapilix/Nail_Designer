import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Plus, Search, Edit2, Trash2, Mail, Phone, Calendar as CalendarIcon, X, Upload, Euro
} from 'lucide-react';

const ROLES = ['Master Nail Artist', 'Especialista em Gel', 'Nail Designer', 'Rececionista', 'Gerente'];

const AdminTeam = () => {
  const [team, setTeam] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form & Modal States
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', role: ROLES[0], email: '', phone: '', commission: '', details: '' });
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('team').select('*').order('name');
      if (error) throw error;
      setTeam(data || []);
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar equipa.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = team.filter(member => 
    member.name.toLowerCase().includes(search.toLowerCase()) || 
    member.role.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', role: ROLES[0], email: '', phone: '', commission: '', details: '' });
    setPreviewImage(null);
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditId(member.id);
    setForm({ 
      name: member.name, 
      role: member.role, 
      email: member.email || '', 
      phone: member.phone || '', 
      commission: member.commission_rate || '',
      details: member.details || ''
    });
    setPreviewImage(member.photo_url || null);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) {
        setUploading(false);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem não pode exceder 5MB.');
        setUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setUploading(false);
      };
      reader.onerror = () => {
        alert('Erro ao processar a imagem.');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar imagem.');
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    
    try {
      const payload = {
        name: form.name,
        role: form.role,
        email: form.email,
        phone: form.phone,
        commission_rate: Number(form.commission) || 0,
        details: form.details,
        photo_url: previewImage
      };

      if (editId) {
        const { error } = await supabase.from('team').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('team').insert([payload]);
        if (error) throw error;
      }
      
      setShowModal(false);
      fetchTeam();
    } catch (e) {
      console.error(e);
      alert('Erro ao gravar dados do membro na base de dados.');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Certeza que queres remover este membro da equipa?')) return;
    try {
      const { error } = await supabase.from('team').delete().eq('id', id);
      if (error) throw error;
      fetchTeam();
    } catch (e) {
      console.error(e);
      alert('Erro ao apagar membro.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-4xl mb-2">Gestão de <i className="text-primary italic font-normal">Equipa</i></h2>
          <p className="text-gray-400 text-sm">Controle de profissionais, permissões, fotos e honorários.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar Staff
        </button>
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-4 bg-secondary px-4 py-2 rounded-xl w-full max-w-md mb-8">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Procurar por nome, cargo..." className="bg-transparent border-none outline-none text-sm w-full" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">A carregar registos da Equipa...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Nenhum registo ativo encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map(member => (
                <motion.div layout key={member.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="group relative bg-secondary rounded-[24px] p-6 flex flex-col items-center border border-gray-50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => openEdit(member)} className="p-2 bg-white rounded-lg text-gray-400 hover:text-primary transition-colors shadow-sm"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(member.id)} className="p-2 bg-white text-gray-400 hover:text-red-500 rounded-lg transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4 relative bg-gray-200">
                    {member.photo_url ? (
                       <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                       <div className="flex items-center justify-center h-full w-full text-xs text-gray-400 font-bold uppercase">Sem Foto</div>
                    )}
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500"></span>
                  </div>

                  <h3 className="text-xl font-bold text-dark">{member.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-6">{member.role}</p>

                  <div className="w-full space-y-3 bg-white p-4 rounded-xl border border-gray-100">
                    {member.email && (
                      <div className="flex items-center justify-between p-2 -mx-2 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600 truncate max-w-[150px]">{member.email}</span></div>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center justify-between p-2 -mx-2 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">{member.phone}</span></div>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-2 -mx-2 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3"><Euro className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Comissão:</span>
                      </div>
                      <span className="text-sm font-bold text-dark">{member.commission_rate}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 backdrop-blur-sm px-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pt-2 pb-4 border-b border-gray-50">
                <h3 className="font-serif text-2xl">{editId ? 'Editar' : 'Novo'} <i className="text-primary font-normal italic">Membro</i></h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-secondary text-gray-400 hover:text-dark transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative group cursor-pointer w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex flex-col items-center justify-center bg-secondary">
                    {previewImage ? (
                      <>
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 text-white z-10 transition-opacity bg-black/40">
                            <Upload className="w-6 h-6 mb-1" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Mudar</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors mb-2" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center px-2">Upload Imagem</span>
                      </>
                    )}
                    <input type="file" disabled={uploading} accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20" />
                  </div>
                </div>
                {uploading && <p className="text-center text-xs text-primary font-bold uppercase tracking-widest">A carregar fotográfia...</p>}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Nome Completo</label>
                    <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none border-none focus:ring-1 focus:ring-primary" placeholder="Ex: Ana Silva" />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Cargo / Especialidade</label>
                    <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none appearance-none border-none focus:ring-1 focus:ring-primary">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none border-none focus:ring-1 focus:ring-primary" placeholder="ana@tobeauty.pt" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Telefone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none border-none focus:ring-1 focus:ring-primary" placeholder="+351 912 345 678" />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Percentagem de Comissão (%)</label>
                    <input type="number" min="0" max="100" value={form.commission} onChange={e => setForm({...form, commission: e.target.value})} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none border-none focus:ring-1 focus:ring-primary" placeholder="Ex: 30" />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Notas Adicionais</label>
                    <textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})} className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary h-20 resize-none" placeholder="Certificações, prémios, especialidades secretas..."></textarea>
                  </div>
                </div>

                <div className="mt-10 flex gap-4 pt-4 border-t border-gray-50">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-xl border border-gray-200 text-sm font-bold uppercase tracking-widest text-gray-500 hover:bg-secondary transition-all">Cancelar</button>
                  <button type="submit" disabled={uploading} className="flex-1 py-4 bg-dark text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-primary/20 disabled:opacity-50">Guardar Membro</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminTeam;
