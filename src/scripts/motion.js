// ============================================================
// A linguagem de movimento da casa, em cinco verbos:
//   Reveal   — algo descobre-se ao entrar no ecrã (.reveal / .unveil)
//   Compose  — elementos pousam um a um (atrasos .d1 .d2 .d3)
//   Focus    — o conjunto e o detalhe trocam de escala ([data-focus])
//   Depth    — dois planos com paralaxe ≤ 12px, só em desktop ([data-depth])
//   Transform— a barra dourada arrasta o espaço quadro a quadro ([data-transform])
// Tudo respeita prefers-reduced-motion: cada estado troca a seco e
// nada essencial vive no movimento.
// ============================================================

const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Reveal / Compose ----------
const alvos = document.querySelectorAll('.reveal, .unveil');
if (reduzido || !('IntersectionObserver' in window)) {
  alvos.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  alvos.forEach((el) => io.observe(el));
  // Rede de segurança: nada fica escondido se o observador não disparar.
  window.setTimeout(() => alvos.forEach((el) => el.classList.add('is-in')), 4000);
}

// ---------- Focus: conjunto ↔ detalhe ----------
document.querySelectorAll('[data-focus]').forEach((grupo) => {
  const botoes = grupo.querySelectorAll('[data-focus-alvo]');
  const aplicar = (alvo) => {
    grupo.dataset.focusAtivo = alvo;
    botoes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.focusAlvo === alvo)));
  };
  botoes.forEach((b) => {
    b.addEventListener('click', () => aplicar(b.dataset.focusAlvo));
    if (window.matchMedia('(hover: hover)').matches) b.addEventListener('mouseenter', () => aplicar(b.dataset.focusAlvo));
  });
  // Toque/clique no prato pequeno também troca o foco.
  grupo.querySelectorAll('[data-focus-troca]').forEach((p) =>
    p.addEventListener('click', () => aplicar(grupo.dataset.focusAtivo === 'detalhe' ? 'conjunto' : 'detalhe')),
  );
});

// ---------- Selectores: lista → imagem (celebrações, serviços) ----------
document.querySelectorAll('[data-seletor]').forEach((grupo) => {
  const botoes = grupo.querySelectorAll('[data-item]');
  const vistas = grupo.querySelectorAll('[data-vista]');
  const aplicar = (id) => {
    botoes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.item === id)));
    vistas.forEach((v) => v.toggleAttribute('hidden', v.dataset.vista !== id));
    grupo.dataset.ativo = id;
  };
  botoes.forEach((b) => {
    b.addEventListener('click', () => aplicar(b.dataset.item));
    if (grupo.dataset.seletor === 'hover') b.addEventListener('mouseenter', () => aplicar(b.dataset.item));
  });
});

// ---------- Transform: a pérola arrasta o espaço ----------
document.querySelectorAll('[data-transform]').forEach((grupo) => {
  const range = grupo.querySelector('input[type="range"]');
  const quadros = grupo.querySelectorAll('[data-quadro]');
  const fill = grupo.querySelector('[data-fill]');
  const rotulo = grupo.querySelector('[data-rotulo]');
  if (!range) return;
  const n = quadros.length;
  const aplicar = () => {
    const i = Number(range.value);
    quadros.forEach((q, k) => {
      q.classList.toggle('is-ativo', k === i);
      q.toggleAttribute('hidden', grupo.dataset.transform === 'palco' && k !== i);
    });
    const pct = n > 1 ? (i / (n - 1)) * 100 : 100;
    if (fill) fill.style.width = `${pct}%`;
    if (rotulo) rotulo.textContent = quadros[i]?.dataset.quadro || '';
    range.setAttribute('aria-valuetext', quadros[i]?.dataset.quadro || '');
    const lista = quadros[i]?.parentElement;
    if (lista && getComputedStyle(lista).overflowX === 'auto') {
      const gutter = parseFloat(getComputedStyle(lista).paddingLeft) || 0;
      lista.scrollTo({ left: Math.max(0, quadros[i].offsetLeft - gutter), behavior: reduzido ? 'auto' : 'smooth' });
    }
  };
  range.addEventListener('input', aplicar);
  aplicar();
  // Sem movimento reduzido, o scroll também avança a sequência (Transform).
  if (!reduzido && 'IntersectionObserver' in window && grupo.dataset.autoplay === 'scroll') {
    let feito = false;
    const io = new IntersectionObserver((es) => {
      if (feito || !es.some((e) => e.isIntersecting)) return;
      feito = true;
      let i = 0;
      const t = setInterval(() => {
        i += 1;
        if (i >= n) return clearInterval(t);
        range.value = String(i);
        aplicar();
      }, 900);
    }, { threshold: 0.5 });
    io.observe(grupo);
  }
});

// ---------- Depth: paralaxe muito controlado, só em desktop ----------
if (!reduzido && window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) {
  const planos = document.querySelectorAll('[data-depth]');
  if (planos.length) {
    let tick = false;
    const mover = () => {
      tick = false;
      const vh = window.innerHeight;
      planos.forEach((p) => {
        const r = p.getBoundingClientRect();
        const centro = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5
        const max = Number(p.dataset.depth) || 12;
        p.style.transform = `translateY(${(-centro * max).toFixed(1)}px)`;
      });
    };
    window.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(mover); } }, { passive: true });
    mover();
  }
}

// ---------- Barra fixa (telemóvel): aparece depois do hero ----------
const barra = document.getElementById('barra-fixa');
const hero = document.querySelector('[data-hero]');
if (barra) {
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver((es) => barra.classList.toggle('is-on', !es[0].isIntersecting), { threshold: 0.1 }).observe(hero);
  } else {
    barra.classList.add('is-on');
  }
}

// ---------- Vídeo de ambiente: sem autoplay no HTML (o atributo forçaria o download
// imediato); toca quando entra no ecrã, nunca com movimento reduzido nem em poupança
// de dados, e tem um botão real para parar (WCAG 2.2.2). ----------
const poupar = navigator.connection && navigator.connection.saveData;
document.querySelectorAll('video[data-ambiente]').forEach((v) => {
  const wrap = v.parentElement;
  const btn = wrap?.querySelector('[data-video-toggle]');
  if (reduzido || poupar) { btn?.remove(); v.remove(); return; }
  let parado = false;
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting && !parado ? v.play().catch(() => {}) : v.pause()));
  }, { threshold: 0.25 });
  io.observe(v);
  btn?.addEventListener('click', () => {
    parado = !parado;
    if (parado) v.pause(); else v.play().catch(() => {});
    btn.setAttribute('aria-pressed', String(!parado));
    btn.setAttribute('aria-label', parado ? 'Reproduzir o vídeo de ambiente' : 'Pausar o vídeo de ambiente');
    const l = btn.querySelector('[data-video-label]'); if (l) l.textContent = parado ? 'Vídeo em pausa' : 'Vídeo · 8 s · sem som';
    v.classList.toggle('is-playing', !parado);
  });
});
