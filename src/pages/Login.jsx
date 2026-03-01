import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pin) {
      setError('Por favor, introduza o PIN.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(pin);
    if (res.success) {
      navigate('/admin'); // Admin route decides what to show based on Role
    } else {
      setError(res.error || 'Erro ao iniciar sessão.');
      setPin('');
    }
    setLoading(false);
  };

  const handleNumClick = (num) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleClear = () => setPin('');
  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold text-dark mb-2">Acesso Restrito</h1>
          <p className="text-muted text-sm">Insira o seu PIN de acesso para continuar</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-border-main">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2 font-medium">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="flex justify-center gap-3">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold
                    ${pin.length > i 
                      ? 'border-primary text-dark bg-white' 
                      : 'border-border-main bg-slate-50 text-transparent'
                    } transition-colors duration-200`}
                >
                  {pin.length > i ? '•' : ''}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {numbers.map((num, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (num === 'C') handleClear();
                    else if (num === '⌫') handleDelete();
                    else handleNumClick(num.toString());
                  }}
                  className={`h-14 rounded-xl text-xl font-medium transition-colors
                    ${typeof num === 'number' 
                      ? 'bg-slate-50 hover:bg-slate-100 text-dark border border-border-main' 
                      : 'bg-white hover:bg-slate-50 text-muted border border-border-main'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>

            <button 
              type="submit" 
              disabled={loading || pin.length < 4}
              className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Entrar <ArrowRight size={20} /></>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
