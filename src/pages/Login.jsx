import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, KeyRound, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { login, setupPin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, role, photo_url, color, pin_code, access_level')
          .order('access_level', { ascending: true }) // Admins first
          .order('name', { ascending: true });
          
        if (!error && data) {
          setTeamMembers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setPin('');
    setError('');
    // If PIN is null, empty string, or '0000', ask to setup a new one
    if (!member.pin_code || member.pin_code === '0000') {
      setIsSetupMode(true);
    } else {
      setIsSetupMode(false);
    }
  };

  const handleBack = () => {
    setSelectedMember(null);
    setPin('');
    setError('');
  };

  const attemptLogin = async (currentPin) => {
    setLoading(true);
    setError('');

    let res;
    if (isSetupMode) {
      res = await setupPin(selectedMember.id, currentPin);
    } else {
      res = await login(selectedMember.id, currentPin);
    }

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Erro ao iniciar sessão.');
      setPin('');
      setLoading(false);
    }
  };

  const handleNumClick = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      
      // Auto-submit when reaching 4 digits
      if (newPin.length === 4) {
        attemptLogin(newPin);
      }
    }
  };

  const handleClear = () => setPin('');
  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'];

  if (loading && teamMembers.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 font-sans overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!selectedMember ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }}
            className="w-full max-w-4xl"
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-dark mb-3 tracking-tight">Portal da Equipa</h1>
              <p className="text-muted">Selecione o seu perfil para entrar</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {teamMembers.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleMemberSelect(m)}
                  className="card p-4 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-4 group text-center border-2 border-transparent hover:shadow-lg"
                  style={{ ':hover': { borderColor: m.color || '#3B82F6' } }}
                >
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-[3px] shadow-sm transform group-hover:scale-105 transition-transform duration-300" style={{ borderColor: m.color || '#3B82F6' }} />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-sm text-3xl font-bold text-white transform group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: m.color || '#3B82F6' }}>
                      {m.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-dark text-sm sm:text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">{m.name}</h3>
                    <p className="text-[10px] sm:text-xs text-muted uppercase tracking-widest mt-1">{m.access_level === 'admin' ? 'Admin' : m.role || 'Profissional'}</p>
                  </div>
                </button>
              ))}
            </div>
            {teamMembers.length === 0 && !loading && (
              <div className="text-center text-muted p-12 bg-white rounded-3xl border border-border-main">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                Nenhum membro da equipa registado.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="pinpad"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md relative"
          >
            <button 
              onClick={handleBack}
              className="absolute -top-16 left-0 flex items-center gap-2 text-muted hover:text-dark font-medium transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-border-main"
            >
              <ArrowLeft size={16} /> Voltar
            </button>

            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-border-main text-center relative overflow-hidden">
              
              {/* Top Banner Color */}
              <div className="absolute top-0 inset-x-0 h-24 opacity-20" style={{ backgroundColor: selectedMember.color || '#3B82F6' }}></div>

              <div className="relative z-10 flex flex-col items-center mb-8">
                {selectedMember.photo_url ? (
                  <img src={selectedMember.photo_url} alt={selectedMember.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4" />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-md text-3xl font-bold text-white border-4 border-white mb-4" style={{ backgroundColor: selectedMember.color || '#3B82F6' }}>
                    {selectedMember.name?.charAt(0) || 'U'}
                  </div>
                )}
                <h2 className="text-xl font-bold text-dark">{selectedMember.name.split(' ')[0]}</h2>
                <div className="inline-block mt-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold uppercase tracking-widest" style={{ color: selectedMember.color || '#3B82F6' }}>
                  {isSetupMode ? 'Criar Acesso' : 'Log In'}
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <p className="text-muted text-sm font-medium">
                  {isSetupMode ? 'Crie o seu novo PIN de 4 dígitos' : 'Insira o seu PIN de acesso'}
                </p>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center justify-center gap-2 font-medium">
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}

                <div className="flex justify-center gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i}
                      className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold transition-all duration-200
                        ${pin.length > i 
                          ? 'border-dark text-dark bg-white shadow-sm scale-110' 
                          : 'border-slate-200 bg-slate-50 text-transparent'
                        }`}
                      style={{ borderColor: pin.length > i ? (selectedMember.color || '#1A1A1E') : undefined }}
                    >
                      {pin.length > i ? '•' : ''}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-6">
                  {numbers.map((num, i) => (
                    <button
                      key={i}
                      disabled={loading}
                      type="button"
                      onClick={() => {
                        if (num === 'C') handleClear();
                        else if (num === '⌫') handleDelete();
                        else handleNumClick(num.toString());
                      }}
                      className={`h-16 rounded-2xl text-2xl font-medium transition-all transform active:scale-95 disabled:opacity-50
                        ${typeof num === 'number' 
                          ? 'bg-slate-50 hover:bg-slate-100 text-dark' 
                          : 'bg-transparent hover:bg-slate-50 text-muted'
                        }
                      `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
