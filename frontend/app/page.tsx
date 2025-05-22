'use client';

import { useEffect, useState } from 'react';
import useMediasoup from '@/hooks/useMediaSoup';

export default function HomePage() {
  const { publish } = useMediasoup();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      <h1>SFU Local Test</h1>
      {mounted && (
        <video
          id="local-video"
          autoPlay
          playsInline
          muted
          style={{ width: 400, height: 300, backgroundColor: 'black' }}
        />
      )}
      <button onClick={publish}>Start Publishing</button>
    </div>
  );
}
