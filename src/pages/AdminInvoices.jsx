import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, FileText, Download, CheckCircle, Clock, X, Upload, TrendingUp, Users } from 'lucide-react';

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  
  // Form State
  const [form, setForm] = useState({ client_id: '', total_amount: '', status: 'pendente', issue_date: new Date().toISOString().split('T')[0] });
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDependancies();
    fetchInvoices();
  }, []);

  const fetchDependancies = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('id, name').order('name');
      if (error) throw error;
      setClients(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`id, total_amount, status, issue_date, receipt_url, clients(id, name)`)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
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
      const fileName = `invoice_${Math.random()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('premium_salon_media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('premium_salon_media').getPublicUrl(filePath);
      setPreviewReceipt(publicUrl);
    } catch (e) {
      console.error(e);
      alert('Erro ao anexar documento na nuvem.');
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ client_id: clients[0]?.id || '', total_amount: '', status: 'pendente', issue_date: new Date().toISOString().split('T')[0] });
    setPreviewReceipt(null);
    setShowModal(true);
  };

  const openEdit = (inv) => {
    setEditTarget(inv.id);
    setForm({
      client_id: inv.clients?.id || '',
      total_amount: String(inv.total_amount),
      status: inv.status,
      issue_date: new Date(inv.issue_date).toISOString().split('T')[0]
    });
    setPreviewReceipt(inv.receipt_url);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.client_id || !form.total_amount || !form.issue_date) return;
    
    try {
      const payload = {
        client_id: form.client_id,
        total_amount: Number(form.total_amount),
        status: form.status,
        issue_date: form.issue_date,
        receipt_url: previewReceipt
      };

      if (editTarget) {
        const { error } = await supabase.from('invoices').update(payload).eq('id', editTarget);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('invoices').insert([payload]);
        if (error) throw error;
      }
      setShowModal(false);
      fetchInvoices();
    } catch (e) {
      console.error(e);
      alert('Erro ao gravar fatura.');
    }
  };

  // Analysis / Filtering
  const filtered = invoices.filter(i => 
     (i.clients?.name || '').toLowerCase().includes(search.toLowerCase()) || 
     i.id.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalInvoices = invoices.length;
  const pendingAmount = invoices.filter(i => i.status === 'pendente').reduce((acc, i) => acc + Number(i.total_amount), 0);
  const collectedAmount = invoices.filter(i => i.status === 'pago').reduce((acc, i) => acc + Number(i.total_amount), 0);

  // Group by client to find top clients (just from invoices)
  const getTopClients = () => {
     let stats = {};
     invoices.forEach(i => {
        const name = i.clients?.name || 'Desconhecido';
        if (!stats[name]) stats[name] = 0;
        stats[name] += Number(i.total_amount);
     });
     return Object.entries(stats).map(([name, val]) => ({ name, val })).sort((a,b) => b.val - a.val).slice(0, 5);
  };

  const topClients = getTopClients();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-4xl mb-2">Gestão de <i className="text-primary italic font-normal">Faturas</i></h2>
          <p className="text-gray-400 text-sm">Emissão de recibos, controlo de pagamentos e análise de faturação.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova Fatura
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 text-dark"><FileText className="w-5 h-5" /></div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Total Emitidas</p>
              <p className="text-3xl font-serif font-bold text-dark">{totalInvoices}</p>
           </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-500"><Clock className="w-5 h-5" /></div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Pagamentos Pendentes</p>
              <p className="text-3xl font-serif font-bold text-amber-500">{pendingAmount.toFixed(2)} €</p>
           </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-50 text-green-500"><CheckCircle className="w-5 h-5" /></div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Receita Faturada</p>
              <p className="text-3xl font-serif font-bold text-green-500">{collectedAmount.toFixed(2)} €</p>
           </div>
        </motion.div>
      </div>

      {/* Analytics Section */}
      <div className="flex flex-col lg:flex-row gap-6">
         {/* Top Invoiced Clients */}
         <div className="flex-1 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <Users className="w-5 h-5 text-primary" />
               <h3 className="font-serif text-2xl text-dark">Top Clientes <i className="text-primary italic font-normal">Faturados</i></h3>
            </div>
            {topClients.length === 0 ? (
               <p className="text-sm text-gray-400 italic">Sem dados de clientes.</p>
            ) : (
               <div className="space-y-4">
                  {topClients.map((client, i) => (
                     <div key={i} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-full bg-dark text-primary flex items-center justify-center font-bold text-xs shadow-sm">#{i+1}</div>
                           <span className="text-sm font-bold text-dark">{client.name}</span>
                        </div>
                        <span className="text-sm text-primary font-bold font-serif">{client.val.toFixed(2)} €</span>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* General Revenue Report Intro */}
         <div className="w-full lg:w-1/3 bg-dark p-8 rounded-[32px] border border-dark shadow-xl text-white flex flex-col justify-center items-center text-center">
            <TrendingUp className="w-12 h-12 text-primary mb-4" />
            <h3 className="font-serif text-3xl mb-2">Relatório Geral</h3>
            <p className="text-sm text-gray-400">O total de receita registada equivale a <strong className="text-white">{collectedAmount.toFixed(2)}€</strong> de liquidez injetada no negócio. Verifique os pagamentos pendentes para evitar quebras de fluxo de caixa.</p>
         </div>
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
        <div className="p-8 border-b border-gray-50 flex justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-4 bg-white px-4 py-3 rounded-xl max-w-md shadow-sm border border-gray-100 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar por fatura ou cliente..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-white border-b border-gray-100">
            <tr>
              {['Nº Fatura', 'Cliente', 'Data', 'Comprovativo', 'Estado', 'Valor', 'Ver'].map((h, i) => (
                <th key={h} className={`px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 ${i === 6 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence>
              {loading ? (
                <tr>
                   <td colSpan="7" className="p-8 text-center text-gray-400 text-sm italic">A processar transações financeiras...</td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map(inv => (
                  <motion.tr key={inv.id} onClick={() => openEdit(inv)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-dark"><FileText className="w-3 h-3"/></div>
                          <span className="font-bold text-dark font-serif text-sm">#{inv.id.slice(0, 8).toUpperCase()}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500 font-medium">{inv.clients?.name || 'Desconhecido'}</td>
                    <td className="px-6 py-5 text-sm font-medium text-dark">{new Date(inv.issue_date).toLocaleDateString()}</td>
                    <td className="px-6 py-5">
                      {inv.receipt_url ? (
                         <a href={inv.receipt_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-primary hover:text-dark text-[10px] font-bold tracking-widest uppercase transition-colors">
                            Ver Anexo
                         </a>
                      ) : (
                         <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Nenhum</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${inv.status.toLowerCase() === 'pago' ? 'bg-green-100/50 text-green-600 border-green-200' : inv.status.toLowerCase() === 'pendente' ? 'bg-amber-100/50 text-amber-600 border-amber-200' : 'bg-red-100/50 text-red-600 border-red-200'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-serif font-bold text-dark">{Number(inv.total_amount).toFixed(2)} €</td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
               ) : (
                <tr><td colSpan="7" className="p-10 text-center text-gray-400 text-sm italic">Nenhuma fatura encontrada.</td></tr>
               )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* CRUD Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif text-2xl">{editTarget ? 'Detalhes da' : 'Nova'} <i className="text-primary font-normal italic">Fatura</i></h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-secondary text-gray-400 hover:text-dark transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2 col-span-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Cliente Faturado</label>
                     <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary">
                       <option value="" disabled>Selecionar Cliente</option>
                       {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                   </div>

                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Data de Emissão</label>
                     <input required type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Estado do Pagamento</label>
                     <select required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary">
                       <option value="pendente">Pendente</option>
                       <option value="pago">Pago</option>
                       <option value="cancelado">Cancelado</option>
                     </select>
                   </div>
                   
                   <div className="space-y-2 col-span-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Valor Faturado (€)</label>
                     <input required type="number" min="0" step="0.01" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-2xl font-serif text-primary placeholder-gray-300" placeholder="0.00" />
                   </div>

                   {/* Anexo de Fatura Original (Storage) */}
                   <div className="space-y-2 col-span-2 mt-2 pt-4 border-t border-gray-50">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-3">
                         <FileText className="w-4 h-4"/> Documento Final / Recibo <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-md text-gray-400 font-medium">Opcional</span>
                      </label>
                      <div className="relative group cursor-pointer w-full h-24 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex flex-col items-center justify-center bg-secondary">
                        {previewReceipt ? (
                           <div className="flex flex-col items-center justify-center w-full h-full relative z-10 group-hover:opacity-40 transition-opacity">
                              <CheckCircle className="w-8 h-8 text-green-500 mb-1" />
                              <span className="text-[10px] font-bold text-dark uppercase tracking-widest">Documento Anexado em Cofre</span>
                           </div>
                        ) : (
                           <div className="flex flex-col items-center justify-center w-full h-full relative z-10">
                              <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors mb-2" />
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digitalize ou carregue a fatura real</span>
                           </div>
                        )}
                        <input type="file" disabled={uploading} accept="image/*,application/pdf" onChange={handleReceiptUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20" />
                      </div>
                      {uploading && <p className="text-center text-[10px] text-primary font-bold uppercase tracking-widest mt-2">A encriptar para a nuvem...</p>}
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex gap-4 justify-end">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-dark transition-all">Cancelar</button>
                  <button type="submit" disabled={uploading} className="bg-dark text-white hover:bg-primary px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
                    {editTarget ? 'Atualizar Fatura' : 'Emitir Fatura'}
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

export default AdminInvoices;
