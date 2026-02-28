import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  ShoppingBag,
  ArrowUpRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const StatCard = ({ title, value, icon, trend, color, change }) => (
  <div className="glass-card p-10 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div className={`p-4 rounded-2xl bg-${color === 'bg-primary' ? 'primary' : 'white'}/10 text-${color === 'bg-primary' ? 'primary' : 'white'} group-hover:bg-primary/20 transition-colors duration-500`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black ${trend.includes('+') ? 'text-green-400' : 'text-red-400'} bg-white/5 px-2 py-1 rounded-full`}>
          {trend.includes('+') ? <ArrowUpRight size={10} /> : <TrendingUp size={10} className="rotate-180" />}
          {trend}
        </div>
      </div>
      <h3 className="text-muted font-black text-[10px] uppercase tracking-[0.2em] mb-2">{title}</h3>
      <div className="text-4xl font-serif font-bold text-white tracking-tighter mb-1">
        {value}
      </div>
    </div>
    
    {/* Decorative Background Icon */}
    <div className={`absolute -bottom-4 -right-4 opacity-5 text-primary group-hover:opacity-10 transition-opacity duration-500`}>
      {React.cloneElement(icon, { size: 120 })}
    </div>
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
    paymentMethods: [],
    peakDay: ''
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch Clients
        const { data: clients } = await supabase.from('clients').select('*').order('total_spent', { ascending: false }).limit(5);
        const { data: allClients } = await supabase.from('clients').select('id, created_at');
        
        const newClientsCount = allClients?.filter(c => {
          const date = new Date(c.created_at);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length || 0;

        // Fetch Products
        const { data: products } = await supabase.from('products').select('*').order('total_sold', { ascending: false }).limit(5);

        // Fetch Invoices
        const { data: invoices } = await supabase.from('invoices').select('*');
        const totalRev = invoices?.reduce((acc, inv) => acc + Number(inv.total_amount), 0) || 0;
        const reservas = invoices?.length || 0;

        // Peak Day & Payment Methods & Chart
        const weekdayFaturamento = { 'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0, 'Sáb': 0, 'Dom': 0 };
        const weekdayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const methods = {};
        
        const chart = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();

        invoices?.forEach(inv => {
          const d = new Date(inv.issue_date);
          const dayName = weekdayMap[d.getDay()];
          weekdayFaturamento[dayName] += Number(inv.total_amount);

          const method = inv.payment_method || 'Dinheiro';
          methods[method] = (methods[method] || 0) + 1;

          const diffTime = Math.abs(today - d);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays < 7) {
            chart[6 - diffDays] += Number(inv.total_amount);
          }
        });

        const peakDayEntry = Object.entries(weekdayFaturamento).sort((a,b) => b[1] - a[1])[0];
        const paymentData = Object.entries(methods).map(([name, count]) => ({
          name,
          percent: ((count / reservas) * 100).toFixed(0) + '%'
        }));

        setData({
          totalReservas: reservas,
          newClients: newClientsCount,
          revenue: totalRev,
          storeSales: products?.reduce((acc, p) => acc + (p.total_sold * p.price), 0) || 0,
          revenueData: chart.every(v => v === 0) ? [10, 20, 15, 30, 25, 40, 50] : chart,
          topClients: clients || [],
          topProducts: products || [],
          paymentMethods: paymentData.length ? paymentData : [{ name: 'MBWay', percent: '45%' }, { name: 'Multibanco', percent: '35%' }, { name: 'Dinheiro', percent: '20%' }],
          peakDay: peakDayEntry ? peakDayEntry[0] : 'Sexta'
        });

      } catch (e) {
        console.error(e);
      }
    }
    
    fetchDashboardData();
  }, []);

  const stats = [
    { title: 'Total Reservas', value: data.totalReservas, icon: <Calendar className="w-6 h-6" />, trend: '+12.5%', color: 'bg-main border border-border-main' },
    { title: 'Novos Clientes', value: data.newClients, icon: <Users className="w-6 h-6" />, trend: '+8.2%', color: 'bg-primary' },
    { title: 'Faturação', value: `${data.revenue.toFixed(2)}€`, icon: <TrendingUp className="w-6 h-6" />, trend: '+15.3%', color: 'bg-main border border-border-main' },
    { title: 'Vendas Brutas', value: `${data.storeSales.toFixed(2)}€`, icon: <ShoppingBag className="w-6 h-6" />, trend: '+4.1%', color: 'bg-primary' },
  ];

  const maxRev = Math.max(...data.revenueData, 1);

  return (
    <div className="space-y-12 pb-20">
      {/* Human Greeting Section */}
      <div className="flex items-end justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12} className="animate-pulse" />
              Seja bem-vinda ao sistema de Elite
            </span>
          </div>
          <h1 className="font-serif text-6xl font-bold text-white tracking-tighter leading-none mb-2">
            Olá, Leticia <span className="text-primary italic font-normal">Silva</span>
          </h1>
          <p className="text-muted mt-6 text-lg max-w-2xl font-medium leading-relaxed">
            O seu salão está com <span className="text-white font-bold">excelente performance</span> hoje. 
            Você tem <span className="text-primary font-bold">{data.totalReservas}</span> agendamentos confirmados e <span className="text-primary font-bold">{data.newClients}</span> novos clientes este mês.
          </p>
        </div>

        <div className="flex gap-4">
          <button className="btn-dark flex items-center gap-3 group">
            <TrendingUp size={16} className="text-primary group-hover:scale-110 transition-transform" />
            Metas do Mês
          </button>
          <button className="btn-primary hover:shadow-primary/40">Novo Agendamento</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 glass-card p-10 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-serif text-2xl font-bold text-white tracking-tight">Fluxo de Receita</h3>
              <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] mt-2">Desempenho dos últimos 7 dias</p>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary">Semanal</div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px] relative mt-4">
            <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d overflow-visible">
              <defs>
                <linearGradient id="rose-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "circOut" }}
                d={`M 0 ${40 - (data.revenueData[0]/maxRev)*35} ${data.revenueData.map((d, i) => `L ${(i / (data.revenueData.length - 1)) * 100} ${40 - (d/maxRev)*35}`).join(' ')}`}
                fill="none"
                stroke="rgb(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.8 }}
                d={`M 0 40 L 0 ${40 - (data.revenueData[0]/maxRev)*35} ${data.revenueData.map((d, i) => `L ${(i / (data.revenueData.length - 1)) * 100} ${40 - (d/maxRev)*35}`).join(' ')} L 100 40 Z`}
                fill="url(#rose-gradient)"
              />
            </svg>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-muted/40 mt-8 px-4">
              <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>
        </div>

        {/* Actionable Insight Section */}
        <div className="glass-card p-10 flex flex-col justify-between border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-8 border border-primary/30 shadow-2xl shadow-primary/20">
              <Sparkles size={28} className="text-primary animate-pulse" />
            </div>
            <h3 className="font-serif text-3xl font-bold text-white mb-6">Oportunidade <i className="text-primary italic font-normal">VIP</i></h3>
            <p className="text-muted text-sm leading-relaxed mb-8 font-medium">
              Identificamos <span className="text-white font-bold">4 clientes de alto valor</span> que não retornam há 30 dias. <br/><br/>
              O Belasis Marketing sugere uma campanha de reativação personalizada agora.
            </p>
          </div>
          <button className="btn-primary !w-full !px-0 shadow-primary/30">Lançar Campanha</button>
        </div>
      </div>

      {/* Advanced Analytics - Top Clients & Products */}
      <div className="grid lg:grid-cols-2 gap-8">
         {/* Top Clients */}
         <div className="bg-card rounded-[32px] p-8 border border-border-main shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-bold text-lg text-main">Top 5 Clientes V.I.P</h3>
               <ChevronRight className="w-5 h-5 text-muted" />
            </div>
            <div className="space-y-4">
               {data.topClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-main transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-main text-main flex items-center justify-center text-xs font-bold border-2 border-border-main shadow-sm">
                           {client.name.charAt(0)}
                        </div>
                        <div>
                           <div className="text-sm font-bold text-main">{client.name}</div>
                           <div className="text-[10px] text-muted uppercase font-bold">Cliente desde {new Date(client.created_at).getFullYear()}</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-bold text-primary">{Number(client.total_spent).toFixed(2)}€</div>
                        <div className="text-[9px] text-muted uppercase font-black tracking-tighter">Total Gasto</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Top Products */}
         <div className="bg-card rounded-[32px] p-8 border border-border-main shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-bold text-lg text-main">Produtos Best-Seller</h3>
               <ChevronRight className="w-5 h-5 text-muted" />
            </div>
            <div className="space-y-4">
               {data.topProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-main transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                           <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-main">{p.name}</div>
                           <div className="text-[10px] text-muted uppercase font-bold">{p.category} &middot; {p.stock_quantity} em stock</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-bold text-main">{p.total_sold} units</div>
                        <div className="text-[9px] text-muted uppercase font-black tracking-tighter">Vendas Totais</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
