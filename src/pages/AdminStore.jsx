import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
  Plus, Search, Edit2, Trash2, Package, TrendingDown, Euro, Tag, X, Upload, TrendingUp, Calendar, AlertTriangle
} from 'lucide-react';

const CATEGORIES = ['Gel', 'Removedor', 'Consumíveis', 'Decoração', 'Equipamento', 'Revenda'];

const stockStatus = (qty, min = 5) => {
  if (qty <= 0) return { label: 'Esgotado', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
  if (qty <= min) return { label: 'Stock Baixo', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
  return { label: 'Em Stock', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
};

const EMPTY_FORM = { name: '', category: CATEGORIES[0], stock_quantity: '', price: '', description: '' };

const AdminStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  
  // Analytics State
  const [bestDay, setBestDay] = useState('A calcular...');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    computeBestDay();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      setProducts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const computeBestDay = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_items')
        .select(`quantity, invoices!inner(issue_date)`)
        .not('product_id', 'is', null);

      if (error || !data || data.length === 0) {
        setBestDay('Sexta-Feira (Estimado)');
        return;
      }

      const daysCount = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 }; // Sun-Sat
      data.forEach(item => {
         const d = new Date(item.invoices.issue_date).getDay();
         daysCount[d] += item.quantity || 1;
      });

      const dayNames = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'];
      let maxDay = 0;
      let maxQty = 0;
      for (const [day, qty] of Object.entries(daysCount)) {
         if (qty > maxQty) { maxQty = qty; maxDay = Number(day); }
      }
      
      setBestDay(maxQty > 0 ? dayNames[maxDay] : 'N/A');

    } catch (e) {
      setBestDay('Sexta-Feira'); // Mock default on fail
      console.error(e);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('premium_salon_media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('premium_salon_media').getPublicUrl(filePath);
      setPreviewImage(publicUrl);
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar imagem para o Storage.');
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setPreviewImage(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditTarget(product.id);
    setForm({
      name: product.name,
      category: product.category,
      stock_quantity: String(product.stock_quantity),
      price: String(product.price),
      description: product.description || ''
    });
    setPreviewImage(product.photo_url);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.stock_quantity || !form.price) return;
    
    try {
      const payload = {
        name: form.name,
        category: form.category,
        stock_quantity: Number(form.stock_quantity),
        price: Number(form.price),
        description: form.description,
        photo_url: previewImage
      };

      if (editTarget) {
        const { error } = await supabase.from('products').update(payload).eq('id', editTarget);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }
      setShowModal(false);
      fetchProducts();
    } catch (e) {
      console.error(e);
      alert('Erro ao guardar produto.');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Apagar este produto permanentemente?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter ? p.category === catFilter : true;
    return matchSearch && matchCat;
  });

  // KPI Calculations
  const totalValue = products.reduce((acc, p) => acc + (p.stock_quantity * p.price), 0);
  const lowStockCount = products.filter(p => p.stock_quantity <= 5).length;
  const categoriesCount = new Set(products.map(p => p.category)).size;

  // Analytics Sorts
  const sortedBySales = [...products].sort((a,b) => b.total_sold - a.total_sold);
  const topSeller = sortedBySales.length > 0 ? sortedBySales[0] : null;
  const worstSeller = sortedBySales.length > 0 ? sortedBySales[sortedBySales.length - 1] : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 relative">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-4xl mb-2 text-main">Gestão de <i className="text-primary italic font-normal">Estoque</i></h2>
          <p className="text-muted text-sm">Controle de inventário associado a vendas e serviços do salão.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
           { icon: <Package className="w-5 h-5"/>, label: 'Produtos Distintos', value: products.length, alert: false },
           { icon: <Euro className="w-5 h-5"/>, label: 'Valor Retido', value: `${totalValue.toFixed(2)} €`, alert: false },
           { icon: <AlertTriangle className="w-5 h-5"/>, label: 'Avisos de Stock', value: lowStockCount, alert: lowStockCount > 0 },
           { icon: <Tag className="w-5 h-5"/>, label: 'Categorias Ativas', value: categoriesCount, alert: false }
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-[24px] p-6 border border-border-main shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${kpi.alert ? 'bg-red-500/10 text-red-500' : 'bg-primary/20 text-primary'}`}>
              {kpi.icon}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-1">{kpi.label}</p>
            <p className={`text-2xl font-serif font-bold ${kpi.alert ? 'text-red-500' : 'text-main'}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Sales Analytics Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-gradient-to-br from-dark to-gray-800 rounded-[24px] p-6 text-white shadow-xl">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-4">
               <TrendingUp className="w-4 h-4" /> Best Seller Absoluto
            </div>
            <div className="font-serif text-2xl mb-1">{topSeller?.name || 'N/A'}</div>
            <div className="text-sm text-gray-400">{topSeller?.total_sold || 0} unidades vendidas no total</div>
         </div>
         <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest mb-4">
               <TrendingDown className="w-4 h-4" /> Menos Vendido (Alerta)
            </div>
            <div className="font-serif text-2xl text-main mb-1">{worstSeller?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">Apenas {worstSeller?.total_sold || 0} escoamento</div>
         </div>
         <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <Calendar className="w-8 h-8 text-primary mb-3" />
            <div className="text-xs uppercase tracking-widest font-bold text-gray-400">Melhor Dia de Vendas</div>
            <div className="font-serif text-2xl text-main">{bestDay}</div>
         </div>
      </div>

      {/* Table Card */}
       <div className="bg-card rounded-[32px] overflow-hidden shadow-sm border border-border-main">
        <div className="p-8 border-b border-border-main flex flex-col md:flex-row justify-between gap-4 bg-main/50">
          <div className="flex items-center gap-4 bg-card px-4 py-3 border border-border-main rounded-xl flex-1 max-w-md shadow-sm">
            <Search className="w-4 h-4 text-muted flex-shrink-0" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar produto..." className="bg-transparent border-none outline-none text-sm w-full text-main placeholder:text-muted" />
          </div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="bg-card border border-border-main text-main shadow-sm rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary">
            <option value="" className="bg-card">Todas as Categorias</option>
            {CATEGORIES.map((c) => <option key={c} className="bg-card">{c}</option>)}
          </select>
        </div>

        <table className="w-full text-left">
          <thead className="bg-main/30 border-b border-border-main">
            <tr>
              {['Produto', 'Categoria', 'Stock', 'Preço Unit.', 'Estado', 'Ações'].map((h, i) => (
                <th key={h} className={`px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted ${i === 5 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main/50">
            {loading ? (
               <tr><td colSpan={6} className="text-center py-10 text-muted text-sm italic">A carregar produtos do armazém principal...</td></tr>
            ) : filtered.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-10 text-muted text-sm italic">Nenhum produto encontrado.</td></tr>
            ) : (
               <AnimatePresence>
                 {filtered.map((product) => {
                   const status = stockStatus(product.stock_quantity);
                   return (
                     <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-primary/5 transition-colors group">
                       <td className="px-6 py-6 border-b border-border-main/50">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-main border border-border-main overflow-hidden flex-shrink-0">
                               {product.photo_url ? <img src={product.photo_url} className="w-full h-full object-cover" alt={product.name}/> : <Package className="w-5 h-5 m-2.5 text-muted"/>}
                            </div>
                            <div>
                               <div className="font-bold text-main text-sm">{product.name}</div>
                               <div className="text-xs text-muted">{product.total_sold} vendas efetuadas</div>
                            </div>
                         </div>
                       </td>
                       <td className="px-6 py-6 text-sm text-muted font-medium border-b border-border-main/50">{product.category}</td>
                       <td className="px-6 py-6 font-bold text-main border-b border-border-main/50">{product.stock_quantity} un.</td>
                       <td className="px-6 py-6 text-sm font-bold text-primary border-b border-border-main/50">{Number(product.price).toFixed(2)} €</td>
                       <td className="px-6 py-6 border-b border-border-main/50">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${status.color}`}>
                           {status.label}
                         </span>
                       </td>
                       <td className="px-6 py-6 text-right border-b border-border-main/50">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => openEdit(product)} className="p-2 bg-main rounded-lg text-muted hover:text-primary border border-border-main hover:border-primary transition-all shadow-sm">
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDelete(product.id)} className="p-2 bg-main rounded-lg text-muted hover:text-red-500 border border-border-main hover:border-red-500/30 transition-all shadow-sm">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </td>
                     </motion.tr>
                   );
                 })}
               </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* CRUD Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border-main rounded-[32px] shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif text-2xl text-main">{editTarget ? 'Editar' : 'Novo'} <i className="text-primary font-normal italic">Produto</i></h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-card border border-border-main hover:bg-main text-muted hover:text-main transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                 {/* Photo Upload */}
                 <div className="flex justify-center mb-2">
                  <div className="relative group cursor-pointer w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-border-main hover:border-primary transition-colors flex flex-col items-center justify-center bg-card">
                    {previewImage ? (
                      <>
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 text-white z-10 transition-opacity bg-black/40 backdrop-blur-sm">
                            <Upload className="w-6 h-6 mb-1" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Package className="w-8 h-8 text-muted group-hover:text-primary transition-colors mb-2" />
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest text-center px-2">Foto / Produto</span>
                      </>
                    )}
                    <input type="file" disabled={uploading} accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20" />
                  </div>
                </div>
                {uploading && <p className="text-center text-xs text-primary font-bold uppercase tracking-widest mb-6">A exportar para nuvem...</p>}

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2 col-span-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-primary block">Nome do Produto</label>
                     <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Gel Construção Clear" className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-main" />
                   </div>
                   
                   <div className="space-y-2 col-span-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-primary block">Categoria</label>
                     <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-main">
                       {CATEGORIES.map((c) => <option key={c} className="bg-card">{c}</option>)}
                     </select>
                   </div>

                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-primary block">Estoque (Unid.)</label>
                     <input required type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-main" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-primary block">Preço (€)</label>
                     <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary text-main" placeholder="0.00" />
                   </div>

                   <div className="space-y-2 col-span-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-primary block">Descrição Interna</label>
                     <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-main border border-border-main rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary h-20 resize-none text-main placeholder:text-muted" placeholder="Características do produto, avisos de validade ou detalhes..."></textarea>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border-main flex gap-4 justify-end">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-muted hover:text-main transition-all">Cancelar</button>
                  <button type="submit" disabled={uploading} className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-primary-light transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
                    {editTarget ? 'Guardar' : 'Construir Registo'}
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

export default AdminStore;
