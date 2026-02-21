import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Bell, Shield, Store, Globe, Users, Image as ImageIcon, Upload, RefreshCw } from 'lucide-react';
import { useImage } from '../hooks/useImage';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('geral');

  const tabs = [
    { id: 'geral', label: 'Geral & Loja', icon: <Store className="w-4 h-4" /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell className="w-4 h-4" /> },
    { id: 'galeria', label: 'Galeria do Site', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'seguranca', label: 'Segurança', icon: <Shield className="w-4 h-4" /> },
    { id: 'equipa', label: 'Permissões', icon: <Users className="w-4 h-4" /> },
  ];

  const { images, updateImage, resetImages } = useImage();

  const handleImageUpload = (e, key) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert('A imagem não pode exceder 1MB para armazenamento local.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateImage(key, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-4xl mb-2">Configurações de <i className="text-primary italic font-normal">Sistema</i></h2>
          <p className="text-gray-400 text-sm">Gira as preferências, acessos e notificações do salão.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" /> Guardar Alterações
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-64 space-y-2 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-dark shadow-sm border border-gray-100' : 'text-gray-400 hover:bg-secondary hover:text-dark'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'geral' && (
              <motion.div key="geral" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-dark mb-1">Informações do Salão</h3>
                  <p className="text-sm text-gray-400 mb-6">Estes dados serão visíveis para os clientes nos emails e faturas.</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-dark block">Nome Comercial</label>
                      <input type="text" defaultValue="TOBeauty Premium Salon" className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-dark block">NIF da Empresa</label>
                      <input type="text" defaultValue="512345678" className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-dark block">Morada Completa</label>
                      <input type="text" defaultValue="Avenida da Liberdade 123, Lisboa" className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                <div>
                  <h3 className="text-lg font-bold text-dark mb-1">Presença Digital</h3>
                  <div className="space-y-6 mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-dark text-sm">Site Público Ativo</p>
                        <p className="text-xs text-gray-400">Permite aos clientes que vejam o site e agendem online.</p>
                      </div>
                      <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <input type="text" defaultValue="https://tobeauty.pt" disabled className="flex-1 bg-secondary text-gray-500 border-none rounded-xl px-4 py-3 text-sm outline-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'galeria' && (
              <motion.div key="galeria" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-lg font-bold text-dark mb-1">Galeria de Imagens</h3>
                    <p className="text-sm text-gray-400">Clique numa imagem para substituir o ficheiro (max 5MB). As alterações aplicam-se imediatamente a todo o site.</p>
                  </div>
                  <button onClick={resetImages} className="text-gray-400 hover:text-red-500 flex items-center gap-2 text-sm font-bold uppercase transition-colors px-4 py-2 border border-gray-100 rounded-lg hover:border-red-500">
                    <RefreshCw className="w-4 h-4" /> Restaurar Originais
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Object.entries(images).map(([key, url]) => (
                    <div key={key} className="space-y-2 group cursor-pointer relative">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors relative isolate">
                        <img src={url} alt={key} className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer">
                          <Upload className="w-6 h-6 text-white mb-2" />
                          <span className="text-white text-xs font-bold uppercase tracking-wider">Alterar</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, key)}
                          />
                        </label>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-dark text-center truncate px-2" title={key}>
                        {key.replace(/_/g, ' ')}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab !== 'geral' && activeTab !== 'galeria' && (
              <motion.div key="other" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm flex items-center justify-center min-h-[400px]">
                <p className="text-gray-400 text-sm">Painel em desenvolvimento.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSettings;
