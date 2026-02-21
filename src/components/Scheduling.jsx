import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, User, Clock, ChevronRight } from 'lucide-react';

const Scheduling = () => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');

  return (
    <section id="agendamento" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row bg-dark rounded-[32px] overflow-hidden shadow-2xl">
          {/* Left Side - Info */}
          <div className="lg:w-2/5 p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase mb-6 block">Agendamento Online</span>
              <h2 className="font-serif text-4xl mb-8 leading-tight">
                Reserve o seu <br />
                <i className="text-primary font-normal italic">Momento de Exclusividade</i>
              </h2>
              <p className="text-gray-400 font-light mb-12 leading-relaxed">
                Escolha o serviço desejado e a sua profissional de eleição. O luxo começa na ponta dos seus dedos.
              </p>
              
              <div className="space-y-8">
                {[
                  { icon: <User className="w-5 h-5" />, title: 'Escolha Profissional', desc: 'Sinta-se à vontade com a sua especialista favorita.' },
                  { icon: <Clock className="w-5 h-5" />, title: 'Disponibilidade Real', desc: 'Verifique horários atualizados em tempo real.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:w-3/5 bg-secondary p-12 lg:p-16">
            <form className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-dark block">Serviço Especializado</label>
                  <select 
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-custom px-4 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                  >
                    <option value="">Selecione um serviço</option>
                    <option value="russian">Manicure Russa</option>
                    <option value="gel">Extensões em Gel</option>
                    <option value="art">Nail Art Artistry</option>
                    <option value="spa">Spa Pedicure</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-dark block">Profissional</label>
                  <select 
                    value={selectedProfessional}
                    onChange={(e) => setSelectedProfessional(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-custom px-4 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                  >
                    <option value="">Qualquer profissional disponível</option>
                    <option value="ana">Ana Silva (Lead Artistry)</option>
                    <option value="luisa">Luísa Pereira (Master Tech)</option>
                    <option value="sofia">Sofia Santos (Nail Artist)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-dark block">Data Preferencial</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full bg-white border border-gray-100 rounded-custom px-4 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm pl-12"
                  />
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="button" 
                  className="w-full bg-dark text-white font-bold py-5 rounded-custom hover:bg-primary transition-all duration-500 shadow-xl flex items-center justify-center gap-3 group uppercase tracking-widest"
                >
                  Verificar Disponibilidade
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
              
              <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
                Confirmação instantânea via SMS & Email.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Scheduling;
