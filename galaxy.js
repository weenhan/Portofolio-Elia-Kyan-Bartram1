(() => {
  const canvas = document.getElementById("galaxyCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0, h = 0, stars = [], meteors = [], raf = 0;
  const rand = (a,b) => Math.random() * (b-a) + a;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.floor(w*dpr); canvas.height = Math.floor(h*dpr);
    canvas.style.width = w+"px"; canvas.style.height = h+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    stars = Array.from({length: Math.min(170, Math.floor(w*h/8500))}, () => ({
      x:rand(0,w), y:rand(0,h), r:rand(.35,1.35), a:rand(.25,.9), tw:rand(.004,.018)
    }));
  }
  function meteor() {
    if (meteors.length < 2 && Math.random() < .012) meteors.push({
      x:rand(w*.35,w), y:rand(0,h*.45), vx:rand(-7,-4), vy:rand(3,5), life:0, max:rand(28,48)
    });
  }
  function draw() {
    ctx.clearRect(0,0,w,h);
    stars.forEach(s => {
      s.a += Math.sin(Date.now()*s.tw)*.002;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(220,230,255,${Math.max(.15,Math.min(.95,s.a))})`; ctx.fill();
    });
    meteor();
    meteors = meteors.filter(m => m.life++ < m.max);
    meteors.forEach(m => {
      m.x += m.vx; m.y += m.vy;
      const alpha = 1 - m.life/m.max;
      const g = ctx.createLinearGradient(m.x,m.y,m.x-m.vx*8,m.y-m.vy*8);
      g.addColorStop(0,`rgba(210,220,255,${alpha})`); g.addColorStop(1,"rgba(150,120,255,0)");
      ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(m.x,m.y); ctx.lineTo(m.x-m.vx*8,m.y-m.vy*8); ctx.stroke();
    });
    if (!reduceMotion) raf = requestAnimationFrame(draw);
  }
  resize(); draw();
  window.addEventListener("resize", resize, {passive:true});
  if (reduceMotion) { cancelAnimationFrame(raf); }
})();