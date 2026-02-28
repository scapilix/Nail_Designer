import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Wallet, Plus, X, Search, Trash2, ArrowDownRight, Calendar, Tag } from 'lucide-react';

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ description: '', category: 'fornecedor', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });

  const fetchData = async () => { setLoading(true); const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false }); setExpenses(data || []); setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => { e.preventDefault(); await supabase.from('expenses').insert([formData]); setIsModalOpen(false); setFormData({ description: '', category: 'fornecedor', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' }); fetchData(); };
  const handleDelete = async (id) => { if (!confirm('Apagar?')) return; await supabase.from('expenses').delete().eq('id', id); fetchData(); };

  const totalExpenses = expenses.reduce((a, e) => a + Number(e.amount||0), 0);
  const thisMonth = expenses.filter(e => { const d = new Date(e.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); });
  const monthExpenses = thisMonth.reduce((a, e) => a + Number(e.amount||0), 0);
  const filtered = expenses.filter(e => e.description?.toLowerCase().includes(search.toLowerCase()));

  const categoryLabels = { fornecedor: 'Fornecedor', aluguel: 'Aluguel', utility: 'Utilidades', salario: 'Salário', marketing: 'Marketing', outros: 'Outros' };
  const categoryColors = { fornecedor: 'badge-info', aluguel: 'badge-warning', utility: 'badge-success', salario: 'badge-danger', marketing: 'bg-purple-50 text-purple-700', outros: 'bg-slate-100 text-slate-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Despesas</h1><p className="text-muted text-sm mt-1">Controle de gastos do salão</p></div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Despesa</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><div className="p-2 rounded-lg bg-red-50 text-red-600 w-fit mb-2"><ArrowDownRight size={18} /></div><p className="text-xs font-medium text-muted uppercase">Total Despesas</p><p className="text-2xl font-bold text-dark mt-1">{totalExpenses.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-amber-50 text-amber-600 w-fit mb-2"><Calendar size={18} /></div><p className="text-xs font-medium text-muted uppercase">Este Mês</p><p className="text-2xl font-bold text-dark mt-1">{monthExpenses.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-blue-50 text-blue-600 w-fit mb-2"><Tag size={18} /></div><p className="text-xs font-medium text-muted uppercase">Nº Despesas</p><p className="text-2xl font-bold text-dark mt-1">{expenses.length}</p></div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-border-main px-4 py-2.5 rounded-lg">
        <Search className="w-4 h-4 text-muted" /><input type="text" placeholder="Pesquisar despesas..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted" />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-border-main">
            <th className="table-header text-left px-6 py-3">Data</th><th className="table-header text-left px-6 py-3">Descrição</th><th className="table-header text-left px-6 py-3">Categoria</th><th className="table-header text-right px-6 py-3">Valor</th><th className="table-header text-right px-6 py-3">Ações</th>
          </tr></thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="table-row">
                <td className="px-6 py-4 text-sm text-dark">{e.date}</td>
                <td className="px-6 py-4"><div className="text-sm font-medium text-dark">{e.description}</div>{e.notes && <div className="text-xs text-muted">{e.notes}</div>}</td>
                <td className="px-6 py-4"><span className={`badge ${categoryColors[e.category] || 'bg-slate-100 text-slate-700'}`}>{categoryLabels[e.category] || e.category}</span></td>
                <td className="px-6 py-4 text-right text-sm font-bold text-red-600">-{Number(e.amount||0).toFixed(2)}€</td>
                <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhuma despesa'}</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main"><h2 className="text-lg font-bold text-dark">Nova Despesa</h2><button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button></div>
                <div className="p-6 space-y-4">
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Descrição *</label><input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="luxury-input" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Categoria</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="luxury-input">
                        <option value="fornecedor">Fornecedor</option><option value="aluguel">Aluguel</option><option value="utility">Utilidades</option><option value="salario">Salário</option><option value="marketing">Marketing</option><option value="outros">Outros</option>
                      </select>
                    </div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Valor (€) *</label><input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="luxury-input" /></div>
                  </div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Data</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="luxury-input" /></div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Notas</label><textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="luxury-input h-20 resize-none" /></div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-border-main bg-slate-50 rounded-b-2xl"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminExpenses;
