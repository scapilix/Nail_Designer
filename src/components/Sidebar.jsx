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
  Plus,
  UserPlus,
  Bell,
  HelpCircle,
  Clock
} from 'lucide-react';

const SidebarSection = ({ title, items }) => (
  <div className="mb-6">
    <h3 className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
      {title}
    </h3>
    <div className="space-y-0.5">
      {items.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === '/admin'}
          className={({ isActive }) => `
            sidebar-link
            ${isActive ? 'sidebar-link-active' : 'text-white/70 hover:text-white hover:bg-white/10'}
          `}
        >
          {React.cloneElement(item.icon, { size: 18, strokeWidth: 1.8 })}
          <span className="font-medium">{item.name}</span>
          {item.badge && (
            <span className="ml-auto bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              {item.badge}
            </span>
          )}
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
        { name: 'Metas', icon: <Target />, path: '/admin/goals' },
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
        { name: 'WhatsApp', icon: <MessageSquare />, path: '/admin/whatsapp' },
      ]
    }
  ];

  return (
    <aside className="w-56 bg-primary flex flex-col h-screen sticky top-0 z-50">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-lg font-bold text-white tracking-tight">
            TO<span className="font-normal opacity-80">Beauty</span>
          </h1>
        </div>
        <p className="text-[10px] text-white/50 font-medium">Olá, LETICIA</p>
        <p className="text-[10px] text-white/40 hover:text-white/60 cursor-pointer">Meu perfil ›</p>
      </div>

      {/* + Novo Button */}
      <div className="px-3 mb-4">
        <button className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm">
          <Plus size={16} strokeWidth={2.5} />
          Novo
        </button>
      </div>

      {/* Invite */}
      <div className="px-3 mb-4">
        <button className="w-full flex items-center gap-2 text-white/60 hover:text-white text-xs py-1.5 px-4 transition-colors">
          <UserPlus size={14} />
          <span>Convidar profissionais</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2">
        {sections.map((section) => (
          <SidebarSection key={section.title} title={section.title} items={section.items} />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <NavLink
          to="/admin/settings"
          className={({ isActive }) => `
            sidebar-link
            ${isActive ? 'sidebar-link-active' : 'text-white/60 hover:text-white hover:bg-white/10'}
          `}
        >
          <Settings size={16} />
          <span className="text-sm">Definições</span>
        </NavLink>
        <button className="sidebar-link text-white/60 hover:text-red-300 hover:bg-red-500/10 w-full">
          <LogOut size={16} />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
