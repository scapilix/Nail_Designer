import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  CalendarCheck, 
  Store, 
  LogOut,
  Bell,
  Search,
  Wallet,
  FileText,
  Settings,
  Crown
} from 'lucide-react';

const AdminLayout = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin' },
    { name: 'Clientes', icon: <Users className="w-5 h-5" />, path: '/admin/clients' },
    { name: 'Agendamentos', icon: <CalendarCheck className="w-5 h-5" />, path: '/admin/bookings' },
    { name: 'Serviços', icon: <Scissors className="w-5 h-5" />, path: '/admin/services' },
    { name: 'Equipa', icon: <Users className="w-5 h-5" />, path: '/admin/team' },
    { name: 'Loja', icon: <Store className="w-5 h-5" />, path: '/admin/store' },
    { name: 'Despesas', icon: <Wallet className="w-5 h-5" />, path: '/admin/expenses' },
    { name: 'Faturas', icon: <FileText className="w-5 h-5" />, path: '/admin/invoices' },
    { name: 'Planos', icon: <Crown className="w-5 h-5" />, path: '/admin/plans' },
    { name: 'Configurações', icon: <Settings className="w-5 h-5" />, path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-main overflow-hidden text-main">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-border-main flex flex-col z-20">
        <div className="p-10">
          <NavLink to="/" className="font-serif text-2xl font-bold tracking-tighter text-main">
            TO<span className="text-primary italic">Beauty</span>
            <div className="flex items-center gap-2 mt-1">
               <span className="block text-[8px] uppercase tracking-[0.4em] text-muted">Admin Panel</span>
               <div className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-full">
                  <span className="text-[7px] font-black uppercase tracking-widest text-primary italic">Premium</span>
               </div>
            </div>
          </NavLink>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `
                flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-muted hover:bg-primary/5 hover:text-primary'}
              `}
            >
              <span className="transition-transform group-hover:scale-110">{item.icon}</span>
              <span className="font-medium text-sm tracking-wide">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
          <button className="flex items-center gap-4 px-6 py-4 text-muted hover:text-red-400 transition-colors w-full group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-secondary relative">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-main/80 backdrop-blur-md px-10 py-6 flex items-center justify-between border-b border-border-main">
          <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-xl border border-border-main shadow-sm w-96">
            <Search className="w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Pesquisar por cliente, serviço..." 
              className="bg-transparent border-none outline-none text-sm w-full text-main placeholder:text-muted"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-muted hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-main"></span>
            </button>
            <div className="h-8 w-[1px] bg-border-main"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-bold text-main">Leticia Silva</div>
                <div className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">Admin</div>
              </div>
              <div className="w-10 h-10 bg-card rounded-xl border-2 border-border-main shadow-md overflow-hidden">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" alt="Admin" />
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <div className="p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
