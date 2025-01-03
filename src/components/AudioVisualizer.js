import React, { useRef, useEffect } from 'react';
import { useMusic } from '../contexts/MusicContext';

const AudioVisualizer = () => {
  const canvasRef = useRef(null);
  const { audioRef } = useMusic();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioRef.current);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    const animate = () => {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      
      // 绘制可视化效果
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ...绘制代码
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);
  
  return <canvas ref={canvasRef} className="visualizer" />;
};

export default AudioVisualizer; 