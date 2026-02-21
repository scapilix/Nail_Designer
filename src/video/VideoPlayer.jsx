import React from 'react';
import { Player } from '@remotion/player';
import { NailShowcase } from './NailShowcase';

// Total frames: 3 scenes × 150 frames, -18 overlap × 2 ≈ 13.8s loop
const TOTAL_FRAMES = 414;

import { useImage } from '../hooks/useImage';

const VideoPlayer = () => {
  const { images } = useImage();

  return (
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
        borderRadius: 0,
      }}
      autoPlay
      loop
      controls={false}
      clickToPlay={false}
    />
  );
};

export default VideoPlayer;
