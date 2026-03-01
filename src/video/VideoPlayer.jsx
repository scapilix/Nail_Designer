import React from 'react';
import { Player } from '@remotion/player';
import { NailShowcase } from './NailShowcase';

const TOTAL_FRAMES = 414;

import { useImage } from '../hooks/useImage';

const VideoPlayer = () => {
  const { images } = useImage();

  return (
    <>
      <style>{`
        .hero-player,
        .hero-player div {
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          max-height: none !important;
          aspect-ratio: unset !important;
          border-radius: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
      <div className="hero-player" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <Player
          component={NailShowcase}
          inputProps={{ images }}
          durationInFrames={TOTAL_FRAMES}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          style={{
            width: '100%',
            height: '100%',
          }}
          autoPlay
          loop
          controls={false}
          clickToPlay={false}
        />
      </div>
    </>
  );
};

export default VideoPlayer;
