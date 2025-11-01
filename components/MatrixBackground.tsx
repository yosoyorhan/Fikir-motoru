import React, { useRef, useEffect } from 'react';

const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const setup = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Check current theme to set colors
      const isLightTheme = document.documentElement.classList.contains('light');

      const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
      const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nums = '0123456789';
      const characters = katakana + latin + nums;
      
      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize);

      const rainDrops: number[] = [];
      for (let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
      }

      const draw = () => {
        ctx.fillStyle = isLightTheme ? 'rgba(249, 249, 249, 0.08)' : 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = isLightTheme ? '#000' : '#0F0';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < rainDrops.length; i++) {
          const text = characters.charAt(Math.floor(Math.random() * characters.length));
          ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

          if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0;
          }
          rainDrops[i]++;
        }
      };
      
      const animate = () => {
          draw();
          animationFrameId = window.requestAnimationFrame(animate);
      }
      
      animate();
    };
    
    setup();
    window.addEventListener('resize', setup);
    
    // Re-run setup if theme changes
    const observer = new MutationObserver(setup);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('resize', setup);
      window.cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} id="matrix-canvas"></canvas>;
};

export default MatrixBackground;