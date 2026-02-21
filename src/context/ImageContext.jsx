import React, { createContext, useState, useEffect } from 'react';

// Chaves para as imagens principais do site
const defaultImages = {
  hero_bg1: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=1920&auto=format&fit=crop',
  hero_bg2: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=1920&auto=format&fit=crop',
  hero_bg3: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=1920&auto=format&fit=crop',
  hero_float1: 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?q=80&w=900&auto=format&fit=crop',
  hero_float2: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=900&auto=format&fit=crop',

  about_main: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1000&auto=format&fit=crop', // Manicure working in salon
  about_detail: 'https://images.unsplash.com/photo-1516975080661-46bca194f509?q=80&w=800&auto=format&fit=crop', // Detail of manicure tools/hands

  service_1: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=800&auto=format&fit=crop',
  service_2: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop',
  service_3: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=800&auto=format&fit=crop',
  service_4: 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?q=80&w=800&auto=format&fit=crop',

  team_1: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800&auto=format&fit=crop',
  team_2: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?q=80&w=800&auto=format&fit=crop',
  team_3: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800&auto=format&fit=crop',
};

const ImageContext = createContext(null);
export { ImageContext };

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState(defaultImages);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('tobeauty_custom_images');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Delaying state set to avoid synchronous cascading during render
        setTimeout(() => setImages(prev => ({ ...prev, ...parsed })), 0);
      } catch (e) {
        console.error('Failed to parse custom images from localStorage', e);
      }
    }
  }, []);

  const updateImage = (key, base64data) => {
    setImages(prev => {
      const next = { ...prev, [key]: base64data };
      try {
        localStorage.setItem('tobeauty_custom_images', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save to localStorage (Quota Exceeded):', err);
        setTimeout(() => alert('Erro: Limite de armazenamento excedido. A imagem ficará visível, mas não será guardada de forma permanente.'), 100);
      }
      return next;
    });
  };

  const resetImages = () => {
    setImages(defaultImages);
    localStorage.removeItem('tobeauty_custom_images');
  };

  return (
    <ImageContext.Provider value={{ images, updateImage, resetImages, defaultImages }}>
      {children}
    </ImageContext.Provider>
  );
};

