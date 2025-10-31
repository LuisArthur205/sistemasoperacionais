(() => {

  const canvasId = 'canvas-Elite1'; 
  const totalFrames = 3;            
  const velocidadeMs = 250;                  
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  

  function syncCanvasSize() {
    const cssWidth = canvas.clientWidth - 30;
    const cssHeight = canvas.clientHeight;
    if (canvas.width !== cssWidth || canvas.height !== cssHeight) {
      canvas.width = cssWidth;
      canvas.height = cssHeight;
    }
  }
  syncCanvasSize();
  window.addEventListener('resize', syncCanvasSize);

  const frames = [];
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    img.src = `sprites_Arthur/${i}.svg`; 
    frames.push(img);
  }

  const loadPromises = frames.map(img =>
    new Promise(resolve => {
      img.onload = () => resolve({ ok: true, img });
      img.onerror = () => {
        console.warn('Falha ao carregar imagem', img.src);
        resolve({ ok: false, img });
      };
    })
  );

  let frameIndex = 0;
  let intervalId = null;

  function desenharFrame() {
    const entry = frames[frameIndex];
    if (entry && entry.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      try {
        ctx.drawImage(entry, 0, 0, canvas.width, canvas.height);
      } catch (e) {
        console.warn('Erro ao desenhar imagem', frames[frameIndex], e);
      }
    }
    frameIndex = (frameIndex + 1) % totalFrames;
  }

  Promise.all(loadPromises).then(results => {
    const anyLoaded = results.some(r => r.ok);
    if (!anyLoaded) {
      console.error('Nenhuma imagem carregada. Verifique os paths das imagens.');
      return;
    }

    results.forEach((r, i) => {
      if (!r.ok) {
        const fallback = results.find(x => x.ok);
        if (fallback) frames[i] = fallback.img;
      }
    });

    desenharFrame();
    intervalId = setInterval(desenharFrame, velocidadeMs);
  });

  window.__animacaoElite1 = { 
    stop() { if (intervalId) clearInterval(intervalId); intervalId = null; },
    start() { if (!intervalId) intervalId = setInterval(desenharFrame, velocidadeMs); },
    redraw() { desenharFrame(); }
  };
})();