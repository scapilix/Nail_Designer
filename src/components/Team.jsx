import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin } from 'lucide-react';
import { useImage } from '../hooks/useImage';

const Team = () => {
  const { images } = useImage();

  const team = [
    {
      name: 'Ana Silva',
      role: 'Lead Nail Artist',
      desc: 'Mestre em Manicure Russa e coloração avançada, com mais de 10 anos de experiência internacional.',
      image: images.team_1
    },
    {
      name: 'Luísa Pereira',
      role: 'Master Technician',
      desc: 'Especialista em extensões de gel e reconstrução, conhecida pela sua precisão geométrica impecável.',
      image: images.team_2
    },
    {
      name: 'Sofia Santos',
      role: 'Nail Artist',
      desc: 'Especialista em design minimalista e tendências contemporâneas de nail art.',
      image: images.team_3
    }
  ];

  return (
    <section id="equipa" className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase mb-4 block">Nossa Equipa</span>
          <h2 className="font-serif text-4xl md:text-5xl mb-6 italic">Mestres da Arte</h2>
          <p className="text-gray-500 font-light leading-relaxed">
            Uma equipa dedicada e apaixonada pela perfeição, focada em transformar a sua visão em realidade.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="aspect-[4/5] rounded-[32px] overflow-hidden mb-8 shadow-lg relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-dark hover:text-white transition-all transform hover:scale-110">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-dark hover:text-white transition-all transform hover:scale-110">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <h4 className="font-serif text-2xl mb-2 text-dark group-hover:text-primary transition-colors">{member.name}</h4>
              <p className="text-primary uppercase text-[10px] font-bold tracking-[0.2em] mb-4">{member.role}</p>
              <p className="text-sm text-gray-400 font-light leading-relaxed max-w-[280px] mx-auto italic border-t border-gray-100 pt-4">
                "{member.desc}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
