import React, { Suspense, lazy } from 'react';
import { motion as Motion } from 'framer-motion';
import { useImage } from '../hooks/useImage';

const VideoPlayer = lazy(() => import('../video/VideoPlayer'));

const Hero = () => {
  const { images } = useImage();

  return (
    <section
      id="inicio"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        marginLeft: 'calc(-50vw + 50%)',
      }}
    >
      {/* Full-screen Remotion Video */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <Suspense
          fallback={
            <img
              src={images.hero_bg1}
              alt="Luxury Salon Interior"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }}
            />
          }
        >
          <VideoPlayer />
        </Suspense>
      </div>

      {/* Scroll Indicator */}
      <Motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-60 z-10"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent"></div>
      </Motion.div>
    </section>
  );
};

export default Hero;
