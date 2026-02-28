import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  DollarSign,
  Clock,
  Star
} from 'lucide-react';

const StatCard = ({ title, value, icon, trend, trendUp, subtitle }) => (
  <div className="stat-card group hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      )}
    </div>
    <h3 className="text-muted text-xs font-medium uppercase tracking-wider mb-1">{title}</h3>
    <div className="text-2xl font-bold text-dark">{value}</div>
    {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState({
    totalReservas: 0,
    newClients: 0,
    revenue: 0,
    storeSales: 0,
    revenueData: [0, 0, 0, 0, 0, 0, 0],
    topClients: [],
    topProducts: [],
    recentBookings: [],
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: clients } = await supabase.from('clients').select('*').order('total_spent', { ascending: false }).limit(5);
        const { data: allClients } = await supabase.from('clients').select('id, created_at');
        
        const newClientsCount = allClients?.filter(c => {
          const date = new Date(c.created_at);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length || 0;

        const { data: products } = await supabase.from('products').select('*').order('total_sold', { ascending: false }).limit(5);
        const { data: invoices } = await supabase.from('invoices').select('*');
        const totalRev = invoices?.reduce((acc, inv) => acc + Number(inv.total_amount), 0) || 0;
        const reservas = invoices?.length || 0;

        const { data: recentBookings } = await supabase
          .from('bookings')
          .select('*, clients(name), services(name)')
          .order('booking_date', { ascending: false })
          .limit(5);

        setData({
          totalReservas: reservas,
          newClients: newClientsCount,
          revenue: totalRev,
          storeSales: products?.reduce((acc, p) => acc + (p.total_sold * p.price), 0) || 0,
          revenueData: [10, 20, 15, 30, 25, 40, 50],
          topClients: clients || [],
          topProducts: products || [],
          recentBookings: recentBookings || [],
        });

      } catch (e) {
        console.error(e);
      }
    }
    
    fetchDashboardData();
  }, []);

  const stats = [
    { title: 'Total Reservas', value: data.totalReservas, icon: <Calendar className="w-5 h-5" />, trend: '+12.5%', trendUp: true, subtitle: 'Este mês' },
    { title: 'Novos Clientes', value: data.newClients, icon: <Users className="w-5 h-5" />, trend: '+8.2%', trendUp: true, subtitle: 'Este mês' },
    { title: 'Faturação', value: `${data.revenue.toFixed(2)}€`, icon: <DollarSign className="w-5 h-5" />, trend: '+15.3%', trendUp: true, subtitle: 'Receita total' },
    { title: 'Vendas Loja', value: `${data.storeSales.toFixed(2)}€`, icon: <ShoppingBag className="w-5 h-5" />, trend: '+4.1%', trendUp: true, subtitle: 'Produtos vendidos' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Painel</h1>
          <p className="text-muted text-sm mt-1">Bem-vinda de volta, Leticia! Aqui está o resumo do seu salão.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">Relatório</button>
          <button className="btn-primary">+ Novo Agendamento</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark">Fluxo de Receita</h3>
              <p className="text-xs text-muted mt-1">Últimos 7 dias</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">Semanal</button>
              <button className="px-3 py-1.5 rounded-lg text-muted hover:bg-slate-50 text-xs font-semibold">Mensal</button>
            </div>
          </div>
          
          <div className="h-48 flex items-end gap-3 px-4">
            {data.revenueData.map((val, i) => {
              const maxVal = Math.max(...data.revenueData, 1);
              const height = (val / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary/10 rounded-t-lg hover:bg-primary/20 transition-colors relative group"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    <div 
                      className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all"
                      style={{ height: `${Math.max(height * 0.7, 3)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-dark mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-medium text-left">
              <Calendar size={18} />
              <span>Novo Agendamento</span>
              <ChevronRight size={14} className="ml-auto" />
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium text-left">
              <Users size={18} />
              <span>Adicionar Cliente</span>
              <ChevronRight size={14} className="ml-auto" />
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-sm font-medium text-left">
              <DollarSign size={18} />
              <span>Registar Venda</span>
              <ChevronRight size={14} className="ml-auto" />
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-sm font-medium text-left">
              <Star size={18} />
              <span>Ver Relatórios</span>
              <ChevronRight size={14} className="ml-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-dark">Top Clientes</h3>
            <button className="text-xs text-primary font-semibold hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3">
            {data.topClients.map((client, i) => (
              <div key={client.id} className="flex items-center justify-between py-2 border-b border-border-main last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {client.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-dark">{client.name}</div>
                    <div className="text-xs text-muted">{client.phone || 'Sem telefone'}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary">{Number(client.total_spent).toFixed(2)}€</div>
              </div>
            ))}
            {data.topClients.length === 0 && (
              <p className="text-sm text-muted text-center py-4">Nenhum cliente encontrado</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-dark">Últimos Agendamentos</h3>
            <button className="text-xs text-primary font-semibold hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3">
            {data.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between py-2 border-b border-border-main last:border-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-dark">{booking.clients?.name || 'Cliente'}</div>
                    <div className="text-xs text-muted">{booking.services?.name || 'Serviço'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-dark">{booking.booking_date}</div>
                  <div className="text-xs text-muted">{booking.booking_time}</div>
                </div>
              </div>
            ))}
            {data.recentBookings.length === 0 && (
              <p className="text-sm text-muted text-center py-4">Nenhum agendamento recente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
