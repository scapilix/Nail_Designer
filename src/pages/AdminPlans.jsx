import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';

const AdminPlans = () => {
  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: '19€',
      period: '/mês',
      description: 'Essencial para a gestão do seu espaço.',
      features: [
        'Agenda de Marcações Pro',
        'Gestão de Clientes',
        'Ficha de Serviços',
        'Atribuição de Equipa',
        'Suporte via Email'
      ],
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-gray-100 text-gray-400',
      active: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '39€',
      period: '/mês',
      description: 'Gestão comercial completa para o seu salão.',
      features: [
        'Tudo do plano Básico',
        'Gestão de Inventário (Loja)',
        'Controlo de Gastos (Despesas)',
        'Faturação Simplificada',
        'Painel Analytics de Vendas'
      ],
      icon: <Sparkles className="w-6 h-6" />,
      color: 'bg-dark text-white',
      active: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '59€',
      period: '/mês',
      description: 'Potência máxima e exclusividade total.',
      features: [
        'Tudo do plano Pro',
        'Dashboard de Gestão Preditiva',
        'Sistema de Fidelização Avançado',
        'Exportação Automática para Contabilidade',
        'Prioridade em Novas Funcionalidades',
        'Consultoria de Performance Trimestral'
      ],
      icon: <Crown className="w-6 h-6" />,
      color: 'bg-primary text-white',
      badge: 'Plano Ativo',
      active: true
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-4xl mb-2">Planos de <i className="text-primary italic font-normal">Subscrição</i></h2>
          <p className="text-gray-400 text-sm">Escolha o nível de ferramentas e inteligência ideal para o seu negócio.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 items-center">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative rounded-[40px] p-10 flex flex-col transition-all duration-500 hover:translate-y-[-10px] ${
              plan.active 
              ? 'bg-white border-2 border-primary shadow-2xl shadow-primary/20 scale-105 z-10 py-14' 
              : 'bg-white border border-gray-100 shadow-sm opacity-80 scale-95'
            }`}
          >
            {plan.badge && (
              <div className="absolute top-6 right-6 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-primary/30 animate-pulse">
                {plan.badge}
              </div>
            )}

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${plan.color} shadow-lg`}>
              {plan.icon}
            </div>

            <div className="mb-8">
              <h3 className="font-serif text-2xl text-dark mb-1">{plan.name}</h3>
              <p className="text-gray-400 text-xs">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold text-dark">{plan.price}</span>
              <span className="text-gray-400 text-sm font-medium">{plan.period}</span>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.active ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400'}`}>
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 leading-tight">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                plan.active 
                ? 'bg-gray-100 text-gray-400 cursor-default' 
                : 'bg-dark text-white hover:bg-primary shadow-xl shadow-dark/10'
              }`}
            >
              {plan.active ? 'Atualmente em Uso' : 'Alterar para este Plano'}
              {!plan.active && <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-dark rounded-[40px] p-12 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
         <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-xl">
               <h4 className="font-serif text-3xl text-white mb-4">Precisa de uma solução <i className="text-primary italic font-normal">Customizada</i>?</h4>
               <p className="text-gray-400 text-sm leading-relaxed">Se gere múltiplas localizações ou precisa de integrações específicas com sistemas externos, a nossa equipa Enterprise está pronta para ajudar.</p>
            </div>
            <button className="px-10 py-5 bg-white text-dark rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-xl">
               Contactar Consultor
            </button>
         </div>
      </div>
    </motion.div>
  );
};

export default AdminPlans;
