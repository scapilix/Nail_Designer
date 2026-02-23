import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, TrendingDown, DollarSign, Calendar, Filter, X, Receipt, Upload, PieChart, FileText } from 'lucide-react';

const CATEGORIES = ['Renda', 'Eletricidade', 'Água', 'Consumíveis', 'Salários', 'Marketing', 'Manutenção', 'Outro'];

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  
  // Form properties
  const [form, setForm] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: CATEGORIES[0] });
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `receipt_${Math.random()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('premium_salon_media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('premium_salon_media').getPublicUrl(filePath);
      setPreviewReceipt(publicUrl);
    } catch (e) {
      console.error(e);
      alert('Erro ao anexar comprovativo na nuvem.');
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: CATEGORIES[0] });
    setPreviewReceipt(null);
    setShowModal(true);
  };

  const openEdit = (exp) => {
    setEditTarget(exp.id);
    setForm({
      description: exp.description,
      amount: String(exp.amount),
      date: new Date(exp.date).toISOString().split('T')[0],
      category: exp.category
    });
    setPreviewReceipt(exp.receipt_url);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount || !form.date) return;
    
    try {
      const payload = {
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
        category: form.category,
        receipt_url: previewReceipt
      };

      if (editTarget) {
        const { error } = await supabase.from('expenses').update(payload).eq('id', editTarget);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('expenses').insert([payload]);
        if (error) throw error;
      }
      setShowModal(false);
      fetchExpenses();
    } catch (e) {
      console.error(e);
      alert('Erro ao gravar despesa.');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Apagar esta despesa permanentemente?')) return;
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      fetchExpenses();
    } catch (e) {
      console.error(e);
    }
  };

  // Analysis / Filtering
  const filtered = expenses.filter(e => e.description.toLowerCase().includes(search.toLowerCase()));
  
  const total = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
  const currentMonthTotal = expenses
     .filter(e => new Date(e.date).getMonth() === new Date().getMonth() && new Date(e.date).getFullYear() === new Date().getFullYear())
     .reduce((acc, exp) => acc + Number(exp.amount), 0);

  // Group by category for Analytics
  const getCategoryStats = () => {
     let stats = {};
     expenses.forEach(e => {
        if (!stats[e.category]) stats[e.category] = 0;
        stats[e.category] += Number(e.amount);
     });
     // format back to array and sort
     return Object.entries(stats)
        .map(([name, val]) => ({ name, val, percentage: (val / total * 100) || 0 }))
        .sort((a,b) => b.val - a.val);
  };

  const categoryStats = getCategoryStats();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 relative">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-4xl mb-2 text-main">Gestão de <i className="text-primary italic font-normal">Despesas</i></h2>
          <p className="text-muted text-sm">Controlo de custos, faturação a fornecedores e saídas de caixa contínuas.</p>
        </div>
        <button onClick={openAdd} className="bg-primary text-white hover:bg-primary-light px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Registar Despesa
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div className="bg-card rounded-[24px] p-6 border border-border-main shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-main text-main border border-border-main"><DollarSign className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-1">Total (Sempre)</p>
              <p className="text-3xl font-serif font-bold text-main">{total.toFixed(2)} €</p>
            </div>
          </motion.div>
          <motion.div className="bg-card rounded-[24px] p-6 border border-border-main shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20"><TrendingDown className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-1">Mês Corrente</p>
              <p className="text-3xl font-serif font-bold text-red-500">{currentMonthTotal.toFixed(2)} €</p>
            </div>
          </motion.div>
          <motion.div className="bg-card rounded-[24px] p-6 border border-border-main shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/20 text-primary border border-primary/20"><Receipt className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-1">Comprovativos Anexos</p>
              <p className="text-3xl font-serif font-bold text-main">{expenses.filter(e => e.receipt_url).length}</p>
            </div>
          </motion.div>
      </div>
      </div>

      {/* Analytics Section */}
      <div className="flex flex-col lg:flex-row gap-6">
         {/* Category Breakdown */}
         <div className="flex-1 bg-card p-8 rounded-[32px] border border-border-main shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <PieChart className="w-5 h-5 text-primary" />
               <h3 className="font-serif text-2xl text-main">Análise de <i className="text-primary italic font-normal">Categorias</i></h3>
            </div>
            {expenses.length === 0 ? (
               <p className="text-sm text-muted italic">Sem dados financeiros para analisar.</p>
            ) : (
               <div className="space-y-4">
                  {categoryStats.slice(0, 5).map((stat, i) => (
                     <div key={i}>
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-sm font-bold text-main">{stat.name}</span>
                           <span className="text-sm text-muted font-medium">{Number(stat.val).toFixed(2)} € <span className="text-xs">({stat.percentage.toFixed(0)}%)</span></span>
                        </div>
                        <div className="w-full h-2 bg-main rounded-full overflow-hidden border border-border-main/50">
                           <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${Math.min(stat.percentage, 100)}%` }} transition={{ delay: i * 0.1, duration: 1 }}
                              className="h-full bg-primary rounded-full relative"
                           />
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Latest Highest Expense */}
         <div className="w-full lg:w-1/3 bg-card p-8 rounded-[32px] border border-border-main shadow-xl text-main">
            <div className="flex items-center gap-3 mb-6">
               <TrendingDown className="w-5 h-5 text-red-500" />
               <h3 className="font-serif text-2xl">Maior <i className="text-primary italic font-normal">Custo</i></h3>
            </div>
            {expenses.length > 0 ? (() => {
               const highest = [...expenses].sort((a,b) => b.amount - a.amount)[0];
               return (
                  <div className="pt-4 border-t border-border-main">
                     <div className="text-red-500 font-serif text-4xl font-bold mb-2">{highest.amount.toFixed(2)} €</div>
                     <div className="text-lg font-bold truncate text-main">{highest.description}</div>
                     <div className="text-xs text-muted mt-2 uppercase tracking-widest">{highest.category} &middot; {new Date(highest.date).toLocaleDateString()}</div>
                  </div>
               );
            })() : <p className="text-sm text-muted italic">Sem registos.</p>}
         </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-[32px] border border-border-main shadow-sm overflow-hidden">
        <div className="p-8 border-b border-border-main/50 flex justify-between items-center gap-4 bg-main/50">
          <div className="flex items-center gap-4 bg-main px-4 py-3 rounded-xl max-w-md shadow-sm border border-border-main flex-1">
            <Search className="w-4 h-4 text-muted" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar despesa..." className="bg-transparent border-none outline-none text-sm w-full text-main placeholder:text-muted" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-muted px-4 py-2 bg-main rounded-full border border-border-main shadow-sm">
             {filtered.length} Registos
          </span>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead>
               <tr className="border-b border-border-main bg-main/30">
                 {['Descrição', 'Categoria', 'Data', 'Recibo', 'Valor', 'Ações'].map((h, i) => (
                   <th key={h} className={`px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted ${i===5?'text-right':''}`}>{h}</th>
                 ))}
               </tr>
             </thead>
             <tbody className="divide-y divide-border-main/50">
               <AnimatePresence>
                 {loading ? (
                   <tr><td colSpan="6" className="p-8 text-center text-gray-400 text-sm italic">Sincronizando livro razão...</td></tr>
                 ) : filtered.length > 0 ? (
                   filtered.map(exp => (
                     <motion.tr key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-gray-50/50 transition-colors group">
                       <td className="px-6 py-4 font-bold text-main max-w-[250px] truncate">{exp.description}</td>
                       <td className="px-6 py-4 text-sm text-gray-500 font-medium">{exp.category}</td>
                       <td className="px-6 py-4 text-sm text-main font-medium">{new Date(exp.date).toLocaleDateString()}</td>
                       <td className="px-6 py-4">
                         {exp.receipt_url ? (
                            <a href={exp.receipt_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:text-primary-light text-xs font-bold tracking-widest uppercase transition-colors">
                               <FileText className="w-4 h-4"/> Ver Anexo
                            </a>
                         ) : (
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Sem Fatura</span>
                         )}
                       </td>
                       <td className="px-6 py-4 text-sm font-bold text-red-500">{Number(exp.amount).toFixed(2)}€</td>
                       <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => openEdit(exp)} className="p-2 bg-white rounded-lg text-gray-400 hover:text-primary border border-gray-100 hover:border-primary transition-all shadow-sm">
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDelete(exp.id)} className="p-2 bg-white rounded-lg text-gray-400 hover:text-red-500 border border-gray-100 hover:border-red-200 transition-all shadow-sm">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </td>
                     </motion.tr>
                   ))
                 ) : (
                   <tr><td colSpan="6" className="p-10 text-center text-gray-400 text-sm italic">Nenhuma despesa correspondente aos critérios.</td></tr>
                 )}
               </AnimatePresence>
             </tbody>
           </table>
        </div>
      </div>

      {/* CRUD Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border-main rounded-[32px] shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif text-2xl text-main">{editTarget ? 'Editar' : 'Nova'} <i className="text-primary font-normal italic">Despesa</i></h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-card border border-border-main hover:bg-main text-muted hover:text-main transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2 col-span-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-primary block">Descrição/Fornecedor</label>
                     <input required type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Fatura EDP Janeiro" className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-main" />
                   </div>
                   
                   <div className="space-y-2 col-span-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-primary block">Categoria Analítica</label>
                     <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-main">
                       {CATEGORIES.map((c) => <option key={c} className="bg-card">{c}</option>)}
                     </select>
                   </div>

                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-primary block">Data Efetiva</label>
                     <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-main" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-primary block">Valor (€)</label>
                     <input required type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-main" placeholder="0.00" />
                   </div>

                   {/* Anexo de Fatura (Storage) */}
                   <div className="space-y-2 col-span-2 mt-2 pt-4 border-t border-border-main/50">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2 mb-3">
                         <Receipt className="w-4 h-4 text-primary"/> Comprovativo de Pagamento <span className="text-[10px] bg-main border border-border-main px-2 py-0.5 rounded-md text-muted font-medium">Opcional</span>
                      </label>
                      <div className="relative group cursor-pointer w-full h-24 rounded-2xl overflow-hidden border-2 border-dashed border-border-main hover:border-primary transition-colors flex flex-col items-center justify-center bg-main">
                        {previewReceipt ? (
                           <div className="flex flex-col items-center justify-center w-full h-full relative z-10 group-hover:opacity-40 transition-opacity">
                              <FileText className="w-8 h-8 text-primary mb-1" />
                              <span className="text-[10px] font-bold text-main uppercase tracking-widest">Documento Anexado</span>
                           </div>
                        ) : (
                           <div className="flex flex-col items-center justify-center w-full h-full relative z-10">
                              <Upload className="w-6 h-6 text-muted group-hover:text-primary transition-colors mb-2" />
                              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Digitalize ou carregue a fatura</span>
                           </div>
                        )}
                        <input type="file" disabled={uploading} accept="image/*,application/pdf" onChange={handleReceiptUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20" />
                      </div>
                      {uploading && <p className="text-center text-[10px] text-primary font-bold uppercase tracking-widest mt-2">A enviar para o cofre suíço digital...</p>}
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border-main flex gap-4 justify-end">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-muted hover:text-main transition-all">Cancelar</button>
                  <button type="submit" disabled={uploading} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-sm shadow-red-500/10 disabled:opacity-50 border border-red-500/20">
                    {editTarget ? 'Atualizar Extrato' : 'Averbar Despesa'}
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

export default AdminExpenses;
