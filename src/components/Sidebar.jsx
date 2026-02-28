import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  Package, 
  Wallet, 
  FileText, 
  Target, 
  BarChart3, 
  Stethoscope, 
  ShoppingBag, 
  Gift, 
  MessageSquare, 
  Share2, 
  Settings, 
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const SidebarSection = ({ title, items }) => (
  <div className="mb-8">
    <h3 className="px-6 mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary/50">
      {title}
    </h3>
    <div className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === '/admin'}
          className={({ isActive }) => `
            sidebar-link group
            ${isActive ? 'sidebar-link-active' : 'text-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <span className="relative z-10 transition-transform duration-500 group-hover:scale-110 group-active:scale-90">
            {React.cloneElement(item.icon, { size: 18, strokeWidth: isActive ? 2.5 : 2 })}
          </span>
          <span className="relative z-10 text-xs font-bold tracking-wide flex-1 whitespace-nowrap">
            {item.name}
          </span>
          {item.isPremium && (
            <Sparkles size={10} className="text-primary animate-pulse" />
          )}
          <ChevronRight size={12} className={`
            ml-auto transition-all duration-500 opacity-0 -translate-x-2
            group-hover:opacity-100 group-hover:translate-x-0
          `} />
          
          {/* Subtle Hover Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </NavLink>
      ))}
    </div>
  </div>
);

const Sidebar = () => {
  const sections = [
    {
      title: 'Principal',
      items: [
        { name: 'Painel', icon: <LayoutDashboard />, path: '/admin' },
        { name: 'Agenda', icon: <Calendar />, path: '/admin/bookings' },
        { name: 'Comandas', icon: <FileText />, path: '/admin/orders' },
        { name: 'Pacotes', icon: <Package />, path: '/admin/plans' },
      ]
    },
    {
      title: 'Financeiro',
      items: [
        { name: 'Transações', icon: <Wallet />, path: '/admin/invoices' },
        { name: 'Comissões', icon: <Gift />, path: '/admin/commissions' },
        { name: 'Caixa', icon: <ShoppingBag />, path: '/admin/cashier' },
      ]
    },
    {
      title: 'Controle',
      items: [
        { name: 'Metas', icon: <Target />, path: '/admin/goals', isPremium: true },
        { name: 'Relatórios', icon: <BarChart3 />, path: '/admin/reports' },
        { name: 'Anamneses', icon: <Stethoscope />, path: '/admin/anamnesis' },
      ]
    },
    {
      title: 'Cadastros',
      items: [
        { name: 'Clientes', icon: <Users />, path: '/admin/clients' },
        { name: 'Serviços', icon: <Scissors />, path: '/admin/services' },
        { name: 'Produtos', icon: <ShoppingBag />, path: '/admin/store' },
        { name: 'Profissionais', icon: <Users />, path: '/admin/team' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { name: 'Agendamento Online', icon: <Share2 />, path: '/admin/online-booking' },
        { name: 'WhatsApp Marketing', icon: <MessageSquare />, path: '/admin/whatsapp', isPremium: true },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-secondary border-r border-white/5 flex flex-col h-screen overflow-hidden sticky top-0 z-50">
      {/* Branding */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-2xl shadow-primary/20">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-white">
              TO<span className="text-primary italic">Beauty</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[8px] uppercase tracking-[0.2em] text-muted font-black">Elite ERP</span>
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-[8px] uppercase tracking-[0.2em] text-primary font-black animate-pulse">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        {sections.map((section) => (
          <SidebarSection key={section.title} title={section.title} items={section.items} />
        ))}
      </div>

      {/* Profile/Footer */}
      <div className="p-6 border-t border-white/5 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/30 transition-all cursor-pointer">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all">
            <img 
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">Leticia Silva</p>
            <p className="text-[10px] text-primary font-black uppercase tracking-wider">Admin Pro</p>
          </div>
          <Settings size={16} className="text-muted group-hover:text-primary transition-colors" />
        </div>

        <button className="flex items-center gap-3 w-full px-6 py-3 rounded-xl text-muted hover:text-red-400 hover:bg-red-400/10 transition-all group">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
