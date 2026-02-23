import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Store, Globe, Users, Image as ImageIcon, Upload, RefreshCw, ExternalLink, CheckCircle, Palette } from 'lucide-react';
import { useImage } from '../hooks/useImage';
import { useTheme } from '../context/ThemeContext';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('geral');
  const [showToast, setShowToast] = useState(false);
  const { theme, setTheme } = useTheme();

  const tabs = [
    { id: 'geral', label: 'Geral & Loja', icon: <Store className="w-4 h-4" /> },
    { id: 'aparencia', label: 'Aparência', icon: <Palette className="w-4 h-4" /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell className="w-4 h-4" /> },
    { id: 'galeria', label: 'Galeria do Site', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'seguranca', label: 'Segurança', icon: <Shield className="w-4 h-4" /> },
    { id: 'equipa', label: 'Permissões', icon: <Users className="w-4 h-4" /> },
  ];

  const { images, updateImage, resetImages } = useImage();

  const handleImageUpload = async (e, key) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem não pode exceder 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        await updateImage(key, reader.result);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const imageCategories = [
    {
      title: 'Destaques do Início (Hero)',
      keys: ['hero_bg1', 'hero_bg2', 'hero_bg3', 'hero_float1', 'hero_float2'],
      labels: {
        hero_bg1: 'Fundo Início 1',
        hero_bg2: 'Fundo Início 2',
        hero_bg3: 'Fundo Início 3',
        hero_float1: 'Foto Flutuante 1',
        hero_float2: 'Foto Flutuante 2',
      }
    },
    {
      title: 'Secção Sobre Nós',
      keys: ['about_main', 'about_detail'],
      labels: {
        about_main: 'Foto Principal',
        about_detail: 'Foto de Detalhe',
      }
    },
    {
      title: 'Cartões de Serviços',
      keys: ['service_1', 'service_2', 'service_3', 'service_4'],
      labels: {
        service_1: 'Serviço 1 (Manicure)',
        service_2: 'Serviço 2 (Extensões)',
        service_3: 'Serviço 3 (Nail Art)',
        service_4: 'Serviço 4 (Spa Pedicure)',
      }
    },
    {
      title: 'Secção da Equipa',
      keys: ['team_1', 'team_2', 'team_3'],
      labels: {
        team_1: 'Membro 1',
        team_2: 'Membro 2',
        team_3: 'Membro 3',
      }
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[200] bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-green-400"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-widest">Alterações gravadas com sucesso!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-4xl mb-2">Configurações de <i className="text-primary italic font-normal">Sistema</i></h2>
          <p className="text-gray-400 text-sm">Gira as preferências, acessos e notificações do salão.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-dark border border-gray-100 hover:bg-secondary transition-all"
          >
            <ExternalLink className="w-4 h-4" /> Ver Site
          </Link>
          <button className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Guardar Alterações
          </button>
        </div>
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
            {activeTab === 'aparencia' && (
              <motion.div key="aparencia" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-dark mb-1">Temas do Sistema</h3>
                  <p className="text-sm text-gray-400 mb-8">Selecione a aparência que melhor se adapta ao seu estilo de marca.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Classic Theme */}
                    <div 
                      onClick={() => setTheme('theme-classic')}
                      className={`cursor-pointer group relative rounded-2xl overflow-hidden border-2 transition-all ${theme === 'theme-classic' ? 'border-primary ring-4 ring-primary/10' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <div className="aspect-video bg-[#F9FAFB] p-4 flex flex-col gap-2">
                        <div className="w-1/2 h-2 bg-[#B8860B] rounded-full"></div>
                        <div className="w-full h-8 bg-white rounded-lg shadow-sm border border-gray-100"></div>
                        <div className="grid grid-cols-3 gap-2 mt-auto">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="p-4 bg-white border-t border-gray-100">
                        <p className="font-bold text-sm text-dark group-hover:text-primary transition-colors">Noir Élégance (Atual)</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Ivory & Gold Luxury</p>
                      </div>
                      {theme === 'theme-classic' && <div className="absolute top-3 right-3 bg-primary text-white p-1 rounded-full"><CheckCircle className="w-4 h-4" /></div>}
                    </div>

                    {/* Neutral White */}
                    <div 
                      onClick={() => setTheme('theme-neutral')}
                      className={`cursor-pointer group relative rounded-2xl overflow-hidden border-2 transition-all ${theme === 'theme-neutral' ? 'border-primary ring-4 ring-primary/10' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <div className="aspect-video bg-white p-4 flex flex-col gap-2">
                        <div className="w-1/2 h-2 bg-[#3B82F6] rounded-full"></div>
                        <div className="w-full h-8 bg-[#F8FAFC] rounded-lg border border-blue-50"></div>
                        <div className="flex gap-2 mt-auto">
                          <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                          <div className="flex-1 h-8 rounded-lg bg-gray-50"></div>
                        </div>
                      </div>
                      <div className="p-4 bg-white border-t border-gray-100">
                        <p className="font-bold text-sm text-dark group-hover:text-primary transition-colors">Pure Canvas</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Neutral White Minimal</p>
                      </div>
                      {theme === 'theme-neutral' && <div className="absolute top-3 right-3 bg-primary text-white p-1 rounded-full"><CheckCircle className="w-4 h-4" /></div>}
                    </div>

                    {/* Dark Premium */}
                    <div 
                      onClick={() => setTheme('theme-dark')}
                      className={`cursor-pointer group relative rounded-2xl overflow-hidden border-2 transition-all ${theme === 'theme-dark' ? 'border-primary ring-4 ring-primary/10' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <div className="aspect-video bg-[#0C0A09] p-4 flex flex-col gap-2">
                        <div className="w-1/2 h-2 bg-[#CA8A04] rounded-full"></div>
                        <div className="w-full h-8 bg-[#1C1917] rounded-lg border border-stone-800"></div>
                        <div className="grid grid-cols-2 gap-2 mt-auto">
                          <div className="h-6 bg-stone-800 rounded"></div>
                          <div className="h-6 bg-stone-800 rounded"></div>
                        </div>
                      </div>
                      <div className="p-4 bg-white border-t border-gray-100">
                        <p className="font-bold text-sm text-dark group-hover:text-primary transition-colors">Midnight Gold</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Dark Premium Luxury</p>
                      </div>
                      {theme === 'theme-dark' && <div className="absolute top-3 right-3 bg-primary text-white p-1 rounded-full"><CheckCircle className="w-4 h-4" /></div>}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                <div>
                  <h3 className="text-lg font-bold text-dark mb-1">Preferências de Interface</h3>
                  <div className="space-y-6 mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-dark text-sm">Animações Suaves</p>
                        <p className="text-xs text-gray-400">Ativa transições fluidas entre páginas e elementos.</p>
                      </div>
                      <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

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
              <motion.div key="galeria" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-12">
                <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-lg font-bold text-dark mb-1">Cestão de Imagens Estáticas</h3>
                      <p className="text-sm text-gray-400">Personalize as fotos principais do seu site. Clique em qualquer imagem para substituir (max 5MB).</p>
                    </div>
                    <button onClick={resetImages} className="text-gray-400 hover:text-red-500 flex items-center gap-2 text-sm font-bold uppercase transition-colors px-4 py-2 border border-gray-100 rounded-lg hover:border-red-500">
                      <RefreshCw className="w-4 h-4" /> Restaurar Originais
                    </button>
                  </div>
                </div>

                {imageCategories.map((cat, cIdx) => (
                  <div key={cat.title} className="space-y-4">
                    <div className="flex items-center gap-4 px-2">
                       <span className="w-8 h-px bg-primary/30"></span>
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{cat.title}</h4>
                       <span className="flex-1 h-px bg-gray-100"></span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {cat.keys.map(key => (
                        <div key={key} className="space-y-3 group cursor-pointer">
                          <div className="aspect-[4/3] rounded-3xl overflow-hidden border-2 border-transparent group-hover:border-primary transition-all relative isolate shadow-sm hover:shadow-xl">
                            <img src={images[key]} alt={key} className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-dark/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer backdrop-blur-sm">
                              <Upload className="w-8 h-8 text-white mb-2" />
                              <span className="text-white text-[10px] font-black uppercase tracking-widest">Substituir</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleImageUpload(e, key)}
                              />
                            </label>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-dark text-center truncate px-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            {cat.labels[key]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
