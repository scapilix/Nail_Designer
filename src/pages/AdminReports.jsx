import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AdminReports = () => {
  const [stats, setStats] = useState({ revenue: 0, expenses: 0, clients: 0, bookings: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [inv, exp, cli, bk, srv] = await Promise.all([
          supabase.from('invoices').select('total_amount, created_at'),
          supabase.from('expenses').select('amount'),
          supabase.from('clients').select('id'),
          supabase.from('bookings').select('id, service_id'),
          supabase.from('services').select('id, name, price')
        ]);
        setStats({
          revenue: (inv.data||[]).reduce((a,i) => a + Number(i.total_amount||0), 0),
          expenses: (exp.data||[]).reduce((a,e) => a + Number(e.amount||0), 0),
          clients: (cli.data||[]).length,
          bookings: (bk.data||[]).length
        });
        setTopServices((srv.data||[]).slice(0,5));
      } catch(e){}
      setLoading(false);
    };
    fetch();
  }, [period]);

  const profit = stats.revenue - stats.expenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Relatórios</h1><p className="text-muted text-sm mt-1">Análise de performance do salão</p></div>
        <div className="flex gap-2">
          {['week','month','year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-sm font-medium ${period === p ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-slate-50'}`}>
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card"><div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 w-fit mb-2"><ArrowUpRight size={18} /></div><p className="text-xs font-medium text-muted uppercase">Receita</p><p className="text-2xl font-bold text-dark mt-1">{stats.revenue.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-red-50 text-red-600 w-fit mb-2"><ArrowDownRight size={18} /></div><p className="text-xs font-medium text-muted uppercase">Despesas</p><p className="text-2xl font-bold text-dark mt-1">{stats.expenses.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-2"><DollarSign size={18} /></div><p className="text-xs font-medium text-muted uppercase">Lucro</p><p className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{profit.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-blue-50 text-blue-600 w-fit mb-2"><Users size={18} /></div><p className="text-xs font-medium text-muted uppercase">Clientes</p><p className="text-2xl font-bold text-dark mt-1">{stats.clients}</p></div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-dark mb-4">Receita vs Despesas</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium text-dark">Receita</span><span className="text-emerald-600 font-bold">{stats.revenue.toFixed(2)}€</span></div>
              <div className="h-3 bg-slate-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.revenue > 0 ? Math.min((stats.revenue / (stats.revenue + stats.expenses)) * 100, 100) : 50}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium text-dark">Despesas</span><span className="text-red-600 font-bold">{stats.expenses.toFixed(2)}€</span></div>
              <div className="h-3 bg-slate-100 rounded-full"><div className="h-full bg-red-500 rounded-full" style={{ width: `${stats.expenses > 0 ? Math.min((stats.expenses / (stats.revenue + stats.expenses)) * 100, 100) : 50}%` }} /></div>
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-dark mb-4">Serviços Populares</h3>
          <div className="space-y-3">
            {topServices.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border-main last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i+1}</span>
                  <span className="text-sm font-medium text-dark">{s.name}</span>
                </div>
                <span className="text-sm font-bold text-primary">{Number(s.price||0).toFixed(2)}€</span>
              </div>
            ))}
            {topServices.length === 0 && <p className="text-sm text-muted text-center py-4">Nenhum serviço</p>}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-dark mb-4">Resumo Geral</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg text-center"><p className="text-xs text-muted mb-1">Agendamentos</p><p className="text-xl font-bold text-dark">{stats.bookings}</p></div>
          <div className="p-4 bg-slate-50 rounded-lg text-center"><p className="text-xs text-muted mb-1">Base Clientes</p><p className="text-xl font-bold text-dark">{stats.clients}</p></div>
          <div className="p-4 bg-slate-50 rounded-lg text-center"><p className="text-xs text-muted mb-1">Ticket Médio</p><p className="text-xl font-bold text-dark">{stats.bookings > 0 ? (stats.revenue / stats.bookings).toFixed(2) : '0.00'}€</p></div>
          <div className="p-4 bg-slate-50 rounded-lg text-center"><p className="text-xs text-muted mb-1">Margem Lucro</p><p className={`text-xl font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{stats.revenue > 0 ? ((profit / stats.revenue) * 100).toFixed(0) : 0}%</p></div>
        </div>
      </div>
    </div>
  );
};
export default AdminReports;
