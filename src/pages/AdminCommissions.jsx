import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Gift, Search, DollarSign, Users, Calendar, CheckCircle } from 'lucide-react';

const AdminCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, t] = await Promise.all([
        supabase.from('commissions').select('*').order('date', { ascending: false }),
        supabase.from('team_members').select('id, name, commission_rate')
      ]);
      setCommissions(c.data || []);
      setTeam(t.data || []);
    } catch(e){}
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const markPaid = async (id) => { await supabase.from('commissions').update({ status: 'pago' }).eq('id', id); fetchData(); };

  const totalPending = commissions.filter(c => c.status === 'pendente').reduce((a,c) => a + Number(c.amount||0), 0);
  const totalPaid = commissions.filter(c => c.status === 'pago').reduce((a,c) => a + Number(c.amount||0), 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-dark">Comissões</h1><p className="text-muted text-sm mt-1">Gestão de comissões da equipa</p></div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><div className="p-2 rounded-lg bg-amber-50 text-amber-600 w-fit mb-2"><DollarSign size={18} /></div><p className="text-xs font-medium text-muted uppercase">Pendentes</p><p className="text-2xl font-bold text-amber-600 mt-1">{totalPending.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 w-fit mb-2"><CheckCircle size={18} /></div><p className="text-xs font-medium text-muted uppercase">Pagas</p><p className="text-2xl font-bold text-emerald-600 mt-1">{totalPaid.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-2"><Users size={18} /></div><p className="text-xs font-medium text-muted uppercase">Profissionais</p><p className="text-2xl font-bold text-dark mt-1">{team.length}</p></div>
      </div>

      {/* Team Commission Rates */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-dark mb-4">Taxas de Comissão por Profissional</h3>
        <div className="space-y-3">
          {team.map(m => (
            <div key={m.id} className="flex items-center justify-between py-3 border-b border-border-main last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{m.name?.charAt(0)}</div>
                <div><div className="text-sm font-semibold text-dark">{m.name}</div><div className="text-xs text-muted">{commissions.filter(c => c.team_member_id === m.id).length} comissões</div></div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">{m.commission_rate || 0}%</div>
                <div className="text-xs text-muted">Total: {commissions.filter(c => c.team_member_id === m.id).reduce((a,c) => a + Number(c.amount||0), 0).toFixed(2)}€</div>
              </div>
            </div>
          ))}
          {team.length === 0 && <p className="text-sm text-muted text-center py-4">Nenhum profissional registado</p>}
        </div>
      </div>

      {/* Commission List */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between">
          <h3 className="font-semibold text-dark">Histórico de Comissões</h3>
          <div className="flex gap-2">
            {['all','pendente','pago'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === f ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-slate-50'}`}>
                {f === 'all' ? 'Todas' : f === 'pendente' ? 'Pendentes' : 'Pagas'}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-border-main"><th className="table-header text-left px-6 py-3">Profissional</th><th className="table-header text-left px-6 py-3">Data</th><th className="table-header text-left px-6 py-3">Taxa</th><th className="table-header text-left px-6 py-3">Estado</th><th className="table-header text-right px-6 py-3">Valor</th></tr></thead>
          <tbody>
            {commissions.filter(c => filter === 'all' || c.status === filter).map(c => (
              <tr key={c.id} className="table-row">
                <td className="px-6 py-4 text-sm font-medium text-dark">{c.member_name || '—'}</td>
                <td className="px-6 py-4 text-sm text-muted">{c.date}</td>
                <td className="px-6 py-4 text-sm text-muted">{c.rate}%</td>
                <td className="px-6 py-4">
                  {c.status === 'pendente' ? <button onClick={() => markPaid(c.id)} className="badge badge-warning cursor-pointer hover:bg-amber-100">Pendente → Pagar</button> : <span className="badge badge-success">Pago</span>}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-dark">{Number(c.amount||0).toFixed(2)}€</td>
              </tr>
            ))}
            {commissions.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhuma comissão registada'}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminCommissions;
