import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { 
  Bell,
  Search,
  Settings,
  HelpCircle
} from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white px-6 flex items-center justify-between border-b border-border-main shrink-0">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-border-main w-full">
              <Search className="w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-muted hover:text-dark hover:bg-slate-50 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 rounded-lg text-muted hover:text-dark hover:bg-slate-50 transition-colors">
              <HelpCircle size={18} />
            </button>
            <button className="p-2 rounded-lg text-muted hover:text-dark hover:bg-slate-50 transition-colors">
              <Settings size={18} />
            </button>

            <div className="h-6 w-px bg-border-main mx-1"></div>

            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-border-main">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" alt="Admin" className="w-full h-full object-cover" />
              </div>
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold text-dark">Leticia Silva</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
