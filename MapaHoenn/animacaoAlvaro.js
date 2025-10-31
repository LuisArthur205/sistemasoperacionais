(() => {
  // Configuração
  const canvasId = 'canvas-Elite4';
  const totalFrames = 4;
  const velocidadeMs = 450;
  const imgPrefix = 'imgAlvaro';
  const imgExt = '.jpeg';

  // Referências e validação
  const canvas = document.getElementById(canvasId);
  if (!canvas) return console.error(`Canvas "${canvasId}" não encontrado.`);
  const ctx = canvas.getContext('2d');
  if (!ctx) return console.error('Contexto 2D não disponível.');

  // Garante que o buffer interno do canvas corresponde aos atributos HTML
  // (evita desenho borrado devido a escala CSS)
  function syncCanvasSize() {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    if (canvas.width !== cssWidth || canvas.height !== cssHeight) {
      canvas.width = cssWidth;
      canvas.height = cssHeight;
    }
  }
  syncCanvasSize();
  window.addEventListener('resize', syncCanvasSize);

  // Carrega frames
  const frames = [];
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    img.src = `${imgPrefix}${i}${imgExt}`;
    frames.push(img);
  }

  // Garantir que a animação não fique travada se houver erro no carregamento
  const loadPromises = frames.map(img =>
    new Promise(resolve => {
      img.onload = () => resolve({ ok: true, img });
      img.onerror = () => {
        console.warn('Falha ao carregar imagem', img.src);
        resolve({ ok: false, img });
      };
    })
  );

  // Controle da animação
  let frameIndex = 0;
  let intervalId = null;

  function desenharFrame() {
    const entry = frames[frameIndex];
    if (entry && entry.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      try {
        ctx.drawImage(entry, 0, 0, canvas.width, canvas.height);
      } catch (e) {
        // caso a imagem esteja corrompida ou inválida
        console.warn('Erro ao desenhar imagem', frames[frameIndex], e);
      }
    }
    frameIndex = (frameIndex + 1) % totalFrames;
  }

  Promise.all(loadPromises).then(results => {
    // Se todos falharam, não iniciar
    const anyLoaded = results.some(r => r.ok);
    if (!anyLoaded) {
      console.error('Nenhuma imagem carregada. Verifique os paths das imagens.');
      return;
    }

    // Ajusta frames inválidos para imagens existentes (opcional)
    results.forEach((r, i) => {
      if (!r.ok) {
        // substitui por primeiro frame válido para evitar gaps
        const fallback = results.find(x => x.ok);
        if (fallback) frames[i] = fallback.img;
      }
    });

    // Desenha imediatamente e inicia o loop com intervalo
    desenharFrame();
    intervalId = setInterval(desenharFrame, velocidadeMs);
  });

  // API pública mínima para controle (útil para depuração)
  window.__animacaoElite4 = {
    stop() { if (intervalId) clearInterval(intervalId); intervalId = null; },
    start() { if (!intervalId) intervalId = setInterval(desenharFrame, velocidadeMs); },
    redraw() { desenharFrame(); }
  };
})();

