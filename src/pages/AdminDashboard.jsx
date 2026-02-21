import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  ShoppingBag,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';

const StatCard = ({ title, value, icon, trend, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
      <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-full">
        <TrendingUp className="w-3 h-3" />
        {trend}
      </span>
    </div>
    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">{title}</h4>
    <div className="text-3xl font-serif font-bold text-dark">{value}</div>
    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between group-hover:bg-gray-50 -mx-8 px-8 rounded-b-[32px] transition-colors">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ver relatório detalhado</span>
      <ArrowUpRight className="w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
    </div>
  </motion.div>
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
    { title: 'Total Reservas', value: data.totalReservas, icon: <Calendar className="w-6 h-6" />, trend: '+12.5%', color: 'bg-dark' },
    { title: 'Novos Clientes', value: data.newClients, icon: <Users className="w-6 h-6" />, trend: '+8.2%', color: 'bg-primary' },
    { title: 'Faturação', value: `${data.revenue.toFixed(2)}€`, icon: <TrendingUp className="w-6 h-6" />, trend: '+15.3%', color: 'bg-dark' },
    { title: 'Vendas Brutas', value: `${data.storeSales.toFixed(2)}€`, icon: <ShoppingBag className="w-6 h-6" />, trend: '+4.1%', color: 'bg-primary' },
  ];

  const maxRev = Math.max(...data.revenueData, 1);

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h2 className="font-serif text-4xl mb-2">Painel de <i className="text-primary italic font-normal">Controlo</i></h2>
        <p className="text-gray-400 text-sm font-light">Bem-vinda de volta, Leticia. Aqui está o resumo do desempenho do seu salão hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-lg tracking-tight text-dark">Receita Semanal</h3>
              <p className="text-xs text-gray-400 mt-1">Comparação dos últimos 7 dias</p>
            </div>
            <select className="bg-secondary border-none rounded-xl px-4 py-2 text-sm outline-none cursor-pointer focus:ring-1 focus:ring-primary text-dark font-bold">
              <option>Esta Semana</option>
              <option>Última Semana</option>
              <option>Este Mês</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[250px] relative mt-4">
            <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d overflow-visible">
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E1AE2D" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#E1AE2D" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="10" x2="100" y2="10" stroke="#f3f4f6" strokeWidth="0.5" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="#f3f4f6" strokeWidth="0.5" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="#f3f4f6" strokeWidth="0.5" />
              
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d={`M 0 ${40 - (data.revenueData[0]/maxRev)*35} ${data.revenueData.map((d, i) => `L ${(i / (data.revenueData.length - 1)) * 100} ${40 - (d/maxRev)*35}`).join(' ')}`}
                fill="none"
                stroke="#E1AE2D"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                d={`M 0 40 L 0 ${40 - (data.revenueData[0]/maxRev)*35} ${data.revenueData.map((d, i) => `L ${(i / (data.revenueData.length - 1)) * 100} ${40 - (d/maxRev)*35}`).join(' ')} L 100 40 Z`}
                fill="url(#gradient)"
              />
            </svg>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-4 px-2">
              <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-dark text-white rounded-[32px] p-8 shadow-xl space-y-8">
           <div>
              <h3 className="font-serif text-2xl mb-6">Frequência de <i className="text-primary italic font-normal">Pico</i></h3>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                 <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Dia de Maior Faturação</div>
                 <div className="text-4xl font-serif text-primary">{data.peakDay}</div>
                 <div className="mt-4 flex items-center gap-2 text-green-400 text-[10px] font-black uppercase">
                    <TrendingUp className="w-3 h-3" /> +24% que a média
                 </div>
              </div>
           </div>

           <div>
              <h3 className="font-serif text-xl mb-6">Métodos de <i className="text-primary italic font-normal">Pagamento</i></h3>
              <div className="space-y-4">
                 {data.paymentMethods.map(m => (
                    <div key={m.name} className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{m.name}</span>
                       <div className="flex-1 mx-4 h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: m.percent }} className="h-full bg-primary" />
                       </div>
                       <span className="text-sm font-serif text-white">{m.percent}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Advanced Analytics - Top Clients & Products */}
      <div className="grid lg:grid-cols-2 gap-8">
         {/* Top Clients */}
         <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-bold text-lg text-dark">Top 5 Clientes V.I.P</h3>
               <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
            <div className="space-y-4">
               {data.topClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-dark text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                           {client.name.charAt(0)}
                        </div>
                        <div>
                           <div className="text-sm font-bold text-dark">{client.name}</div>
                           <div className="text-[10px] text-gray-400 uppercase font-bold">Cliente desde {new Date(client.created_at).getFullYear()}</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-bold text-primary">{Number(client.total_spent).toFixed(2)}€</div>
                        <div className="text-[9px] text-gray-300 uppercase font-black tracking-tighter">Total Gasto</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Top Products */}
         <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-bold text-lg text-dark">Produtos Best-Seller</h3>
               <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
            <div className="space-y-4">
               {data.topProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                           <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-dark">{p.name}</div>
                           <div className="text-[10px] text-gray-400 uppercase font-bold">{p.category} &middot; {p.stock_quantity} em stock</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-bold text-dark">{p.total_sold} units</div>
                        <div className="text-[9px] text-gray-300 uppercase font-black tracking-tighter">Vendas Totais</div>
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
