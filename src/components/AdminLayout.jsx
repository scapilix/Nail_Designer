import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { 
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-secondary overflow-hidden text-white font-sans">
      {/* Premium Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-secondary relative overflow-hidden">
        {/* Elite Top Header */}
        <header className="z-40 h-24 bg-secondary/80 backdrop-blur-2xl px-12 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-6 group w-full max-w-xl">
            <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 shadow-inner-premium w-full group-focus-within:bg-white/10 group-focus-within:border-primary/30 transition-all duration-500">
              <Search className="w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Pesquisar por clientes, faturas ou agendamentos..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-muted/60"
              />
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4">
              <button className="relative p-3 rounded-xl bg-white/5 text-muted hover:text-primary hover:bg-white/10 transition-all duration-500 overflow-hidden group">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-4 ring-secondary animate-pulse"></span>
              </button>
            </div>

            <div className="h-10 w-[1px] bg-white/5"></div>

            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="text-right">
                <div className="text-sm font-black text-white group-hover:text-primary transition-colors tracking-tight">Leticia Silva</div>
                <div className="text-[10px] text-primary font-black uppercase tracking-[0.2em] leading-none opacity-80">Elite Admin Panel</div>
              </div>
              <div className="relative group/avatar">
                <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-primary/50 to-transparent group-hover:from-primary transition-all duration-500">
                  <div className="w-full h-full rounded-[14px] overflow-hidden border-2 border-secondary shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" alt="Admin" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-secondary rounded-full shadow-lg"></div>
              </div>
              <ChevronDown size={14} className="text-muted group-hover:text-primary transition-all duration-500 group-hover:rotate-180" />
            </div>
          </div>
        </header>

        {/* Content View with Smooth Entrance */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="p-12 animate-fade-in-up">
            <Outlet />
          </div>

          {/* Background Decorative Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10 rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 blur-[120px] -z-10 rounded-full"></div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
