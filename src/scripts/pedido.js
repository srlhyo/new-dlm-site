// ============================================================
// O pedido de orçamento — capítulos numa página só.
// Um capítulo aberto de cada vez; os feitos recolhem em linhas-resumo
// com «Editar»; os futuros ficam serenos a 55%. A barra dourada em
// baixo enche com os obrigatórios e diz sempre a PRÓXIMA acção.
//
// Ao enviar, o pedido entra na app de gestão pela RPC pública
// `captacao_submeter` (a mesma porta que /interesse/:slug usa), com as
// chaves canónicas das respostas. Sem Supabase configurado, ou se a
// rede falhar, a mensagem segue pelo WhatsApp — nunca se perde.
// ============================================================
import { PACOTES, PERSONALIZADO, pacoteSugerido, rotuloPacoteParaPedido } from '../data/pacotes.js';

const raiz = document.querySelector('[data-pedido]');
if (raiz) iniciar(raiz);

function iniciar(raiz) {
  const cfg = { url: raiz.dataset.url, anon: raiz.dataset.anon, slug: raiz.dataset.slug || 'doluxoamesa', wa: raiz.dataset.wa || '' };
  const form = raiz.querySelector('[data-form]');
  const caps = [...raiz.querySelectorAll('.capitulo')];
  const barra = raiz.querySelector('[data-barra]');
  const btnAvancar = barra.querySelector('[data-avancar]');
  const btnAnterior = barra.querySelector('[data-anterior]');
  const rotulo = barra.querySelector('[data-rotulo]');
  const fill = barra.querySelector('[data-fill]');
  const pct = barra.querySelector('[data-pct]');
  const progresso = raiz.querySelector('[data-progresso]');
  const $ = (s) => raiz.querySelector(s);

  const CHAVE = 'dlm-pedido';
  const vazio = { tipo: '', tipoNome: '', tipoOutro: '', dataModo: 'exata', data: '', dataAprox: '', local: '', tipoLocal: '', conv: '', servicos: [], pacote: null, complementares: [], mensagem: '', canal: '', nome: '', contacto: '', whatsapp: true };
  let st = { ...vazio };
  try { st = { ...vazio, ...JSON.parse(sessionStorage.getItem(CHAVE) || '{}') }; } catch {}
  const guardar = () => { try { sessionStorage.setItem(CHAVE, JSON.stringify(st)); } catch {} };

  // Parâmetros de entrada: ?pacote=Supreme · ?convidados=35
  const q = new URLSearchParams(location.search);
  if (q.get('pacote')) {
    const alvo = q.get('pacote').trim().toLowerCase();
    const p = [...PACOTES, PERSONALIZADO].find((x) => [x.nome, x.id].map((s) => s.toLowerCase()).includes(alvo));
    if (p) { st.pacote = p.nome; if (!st.servicos.includes('buffet')) st.servicos.push('buffet'); }
  }
  if (q.get('convidados')) st.conv = q.get('convidados').replace(/\D/g, '').slice(0, 4);

  let atual = 0;
  const ROTULOS = ['Continuar: a data e o local →', 'Continuar: os serviços →', 'Continuar: sobre si →', 'Rever o pedido →', 'Enviar pedido'];

  // ---------- ligação dos campos ----------
  const pressionar = (grupo, valor, multi = false) => {
    grupo.querySelectorAll('[data-valor], [data-tipo], [data-servico]').forEach((b) => {
      const v = b.dataset.valor ?? b.dataset.tipo ?? b.dataset.servico;
      const on = multi ? valor.includes(v) : v === (valor ?? '');
      b.setAttribute('aria-pressed', String(on));
    });
  };
  const tiposG = $('[data-campo="tipo"]');
  tiposG.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tipo]'); if (!b) return;
    st.tipo = b.dataset.tipo; st.tipoNome = b.dataset.nome; pintar();
  });
  $('#tipoOutro').addEventListener('input', (e) => { st.tipoOutro = e.target.value; pintar(false); guardar(); });
  ['data', 'dataAprox', 'local', 'nome', 'contacto', 'mensagem'].forEach((id) => $(`#${id}`).addEventListener('input', (e) => { st[id] = e.target.value; limparErro(id === 'dataAprox' ? 'data' : id); pintar(false); guardar(); }));
  $('#data').setAttribute('min', new Date().toISOString().slice(0, 10));
  $('[data-campo="dataModo"]').addEventListener('click', (e) => { const b = e.target.closest('[data-valor]'); if (!b) return; st.dataModo = b.dataset.valor; limparErro('data'); pintar(); ($(st.dataModo === 'exata' ? '#data' : '#dataAprox')).focus(); });
  $('#canal').addEventListener('change', (e) => { st.canal = e.target.value; guardar(); });
  $('[data-campo="tipoLocal"]').addEventListener('click', (e) => { const b = e.target.closest('[data-valor]'); if (!b) return; st.tipoLocal = b.dataset.valor; limparErro('tipoLocal'); pintar(); });
  const conv = $('#conv');
  conv.addEventListener('input', () => { st.conv = conv.value.replace(/\D/g, '').slice(0, 4); limparErro('conv'); pintar(false); guardar(); });
  $('[data-menos]').addEventListener('click', () => { st.conv = String(Math.max(1, (Number(st.conv) || 1) - 1)); pintar(); });
  $('[data-mais]').addEventListener('click', () => { st.conv = String((Number(st.conv) || 0) + 1); pintar(); });
  $('[data-campo="servicos"]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-servico]'); if (!b) return;
    const id = b.dataset.servico;
    st.servicos = st.servicos.includes(id) ? st.servicos.filter((s) => s !== id) : [...st.servicos, id];
    if (!st.servicos.includes('buffet')) st.pacote = null;
    limparErro('servicos'); pintar();
  });
  $('[data-campo="pacote"]').addEventListener('click', (e) => { const b = e.target.closest('[data-valor]'); if (!b) return; st.pacote = b.dataset.valor; pintar(); });
  $('[data-campo="complementares"]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-valor]'); if (!b) return;
    const id = b.dataset.valor;
    st.complementares = st.complementares.includes(id) ? st.complementares.filter((s) => s !== id) : [...st.complementares, id];
    pintar();
  });
  form.querySelector('[name="whatsapp"]').addEventListener('change', (e) => { st.whatsapp = e.target.checked; guardar(); });
  form.addEventListener('submit', (e) => e.preventDefault());

  // Cabeçalhos: só os capítulos feitos (ou o aberto) se abrem ao clique.
  caps.forEach((c) => c.querySelectorAll('[data-abrir]').forEach((b) => b.addEventListener('click', () => {
    if (c.dataset.estado === 'futuro') return;
    abrir(Number(c.dataset.cap));
  })));

  // ---------- validação por capítulo (nunca se vêem erros de onde não se esteve) ----------
  const digitos = (s) => (s || '').replace(/\D/g, '');
  const validar = (n) => {
    const e = {};
    if (n === 0 && !st.tipo) e.tipo = 'Escolha o tipo de evento.';
    if (n === 1) {
      if (st.dataModo === 'aprox' ? !st.dataAprox.trim() : !st.data.trim()) e.data = st.dataModo === 'aprox' ? 'Indique o mês ou a época aproximada.' : 'Indique a data do evento, ou escolha «Ainda não sei ao certo».';
      if (!st.local.trim()) e.local = 'Indique a localidade do evento.';
      if (!st.tipoLocal) e.tipoLocal = 'Escolha o tipo de espaço.';
      if (!(Number(st.conv) >= 1)) e.conv = 'Indique o número aproximado de convidados.';
    }
    if (n === 2 && st.servicos.length === 0) e.servicos = 'Escolha pelo menos um serviço.';
    if (n === 3) {
      if (!st.nome.trim()) e.nome = 'Indique o nome.';
      if (digitos(st.contacto).length < 9) e.contacto = 'O contacto precisa de pelo menos 9 dígitos (pode usar espaços ou indicativo).';
    }
    return e;
  };
  const mostrarErros = (e) => {
    raiz.querySelectorAll('[data-erro]').forEach((p) => { p.hidden = true; p.textContent = ''; });
    raiz.querySelectorAll('[aria-invalid]').forEach((i) => i.removeAttribute('aria-invalid'));
    raiz.querySelectorAll('[aria-describedby^="erro-"]').forEach((i) => i.removeAttribute('aria-describedby'));
    Object.entries(e).forEach(([k, msg]) => {
      const p = raiz.querySelector(`[data-erro="${k}"]`); if (p) { p.textContent = msg; p.hidden = false; }
      const alvo = raiz.querySelector(`#${k}`) || raiz.querySelector(`[data-campo="${k}"]`);
      if (alvo) { alvo.setAttribute('aria-invalid', 'true'); alvo.setAttribute('aria-describedby', `erro-${k}`); }
    });
    const primeiro = Object.keys(e)[0];
    if (primeiro) (raiz.querySelector(`#${primeiro}`) || raiz.querySelector(`[data-campo="${primeiro}"]`))?.focus?.();
  };
  const limparErro = (k) => {
    const p = raiz.querySelector(`[data-erro="${k}"]`); if (p) { p.hidden = true; p.textContent = ''; }
    const alvo = raiz.querySelector(`#${k}`) || raiz.querySelector(`[data-campo="${k}"]`);
    if (alvo) { alvo.removeAttribute('aria-invalid'); alvo.removeAttribute('aria-describedby'); }
  };

  // ---------- progresso: os obrigatórios enchem a barra ----------
  const obrigatorios = () => [
    Boolean(st.tipo), Boolean(dataTexto()), Boolean(st.local.trim()), Boolean(st.tipoLocal), Boolean(st.conv && Number(st.conv) > 0),
    st.servicos.length > 0, Boolean(st.nome.trim()), digitos(st.contacto).length >= 9,
  ];

  // ---------- resumo ----------
  const conv1 = (n) => `${n} ${Number(n) === 1 ? 'convidado' : 'convidados'}`;
  const dataTexto = () => {
    if (st.dataModo === 'aprox') return st.dataAprox.trim();
    if (!st.data.trim()) return '';
    const d = new Date(`${st.data.trim()}T00:00:00`);
    return Number.isNaN(d.getTime()) ? st.data.trim() : d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const nomePacote = () => st.pacote === '' ? 'medida a decidir' : st.pacote || null;
  const complementaresNomes = () => st.complementares.map((id) => raiz.querySelector(`[data-campo="complementares"] [data-valor="${id}"]`)?.textContent.trim()).filter(Boolean);
  const servicosTexto = () => {
    const partes = [];
    if (st.servicos.includes('mesa-posta')) partes.push('Mesa Posta');
    if (st.servicos.includes('buffet')) partes.push(`Buffet & Catering${nomePacote() ? ` (${nomePacote()})` : ''}`);
    return partes.join(' · ');
  };
  const tipoTexto = () => (st.tipo === 'outra' && st.tipoOutro.trim() ? st.tipoOutro.trim() : st.tipoNome);
  const linhasResumo = () => [
    ['Evento', tipoTexto(), 0], ['Data', dataTexto(), 1], ['Local', `${st.local.trim()}${st.tipoLocal ? ` · ${st.tipoLocal}` : ''}`, 1],
    ['Convidados', st.conv ? `≈ ${conv1(st.conv)}` : '', 1], ['Serviços', servicosTexto(), 2], ['Complementares', complementaresNomes().join(' · '), 2],
    ['Mensagem', st.mensagem.trim(), 2], ['Contacto', [st.nome.trim(), st.contacto.trim(), st.whatsapp ? 'WhatsApp' : ''].filter(Boolean).join(' · '), 3],
  ].filter(([, v]) => v);
  const desenharFolha = (el, editavel) => {
    el.innerHTML = `<p class="cap" style="color:var(--ouro-texto)">Resumo</p><h3 class="h3" style="margin:8px 0 12px">O pedido</h3>` +
      linhasResumo().map(([k, v, n]) => `<div class="linha"><span class="k">${k}</span><span class="v">${escapar(v)}</span>${editavel ? `<button type="button" class="e" data-editar="${n}">Editar</button>` : ''}</div>`).join('');
    el.querySelectorAll('[data-editar]').forEach((b) => b.addEventListener('click', () => abrir(Number(b.dataset.editar))));
  };
  const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- pintar o estado no ecrã ----------
  function pintar(guarda = true) {
    pressionar(tiposG, st.tipo);
    $('[data-so-outra]').hidden = st.tipo !== 'outra';
    $('#tipoOutro').value = st.tipoOutro; $('#data').value = st.data; $('#dataAprox').value = st.dataAprox; $('#local').value = st.local;
    pressionar($('[data-campo="dataModo"]'), st.dataModo);
    $('[data-data-exata]').hidden = st.dataModo !== 'exata';
    $('[data-data-aprox]').hidden = st.dataModo !== 'aprox';
    pressionar($('[data-campo="tipoLocal"]'), st.tipoLocal);
    if (conv.value !== st.conv) conv.value = st.conv;
    const sug = pacoteSugerido(st.conv);
    $('[data-sugestao]').textContent = sug
      ? sug === PERSONALIZADO.nome
        ? `Para ${conv1(st.conv)}, o buffet é personalizado: pedimos o número exato e respondemos com um orçamento calculado.`
        : `Para ${conv1(st.conv)}, o ${sug} costuma ser a medida certa, se quiser buffet. Decide-se no próximo passo.`
      : '';
    pressionar($('[data-campo="servicos"]'), st.servicos, true);
    $('[data-so-buffet]').hidden = !st.servicos.includes('buffet');
    $('[data-pac-sug]').textContent = sug ? `· sugestão para ${conv1(st.conv)}` : '';
    $('[data-campo="pacote"]').querySelectorAll('[data-valor]').forEach((b) => { const s = b.querySelector('.sug'); if (s) s.hidden = b.dataset.valor !== sug; });
    pressionar($('[data-campo="pacote"]'), st.pacote === null ? '__nenhum__' : st.pacote);
    pressionar($('[data-campo="complementares"]'), st.complementares, true);
    $('#mensagem').value = st.mensagem; $('#canal').value = st.canal; $('#nome').value = st.nome; $('#contacto').value = st.contacto;
    form.querySelector('[name="whatsapp"]').checked = st.whatsapp;
    // resumos dos capítulos feitos
    const resumos = [tipoTexto(), [dataTexto(), st.local.trim(), st.conv ? `≈ ${conv1(st.conv)}` : ''].filter(Boolean).join(' · '), [servicosTexto(), ...complementaresNomes()].filter(Boolean).join(' · '), [st.nome.trim(), st.contacto.trim()].filter(Boolean).join(' · ')];
    caps.forEach((c) => { const r = c.querySelector('[data-resumo]'); if (r) r.textContent = resumos[Number(c.dataset.cap)] || ''; });
    // barra
    const ok = obrigatorios(); const p = Math.round((ok.filter(Boolean).length / ok.length) * 100);
    fill.style.width = `${p}%`; pct.textContent = `${p}% preenchido`;
    btnAvancar.classList.toggle('is-cheio', p >= 60);
    btnAvancar.classList.toggle('is-pronto', atual === 4 && p === 100);
    rotulo.textContent = ROTULOS[atual];
    btnAnterior.hidden = atual === 0;
    if (atual === 4) desenharFolha($('[data-folha]'), true);
    if (guarda) guardar();
  }

  function abrir(n, { focar = true } = {}) {
    atual = n;
    caps.forEach((c) => {
      const k = Number(c.dataset.cap);
      c.dataset.estado = k === n ? 'aberto' : k < n ? 'feito' : (c.dataset.estado === 'feito' ? 'feito' : 'futuro');
      const cab = c.querySelector('.cab');
      if (cab) { cab.disabled = c.dataset.estado === 'futuro'; cab.setAttribute('aria-expanded', String(k === n)); }
    });
    progresso?.querySelectorAll('li').forEach((li) => {
      const k = Number(li.dataset.passo);
      li.classList.toggle('feito', k < n);
      if (k === Math.min(n, 3)) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    mostrarErros({});
    pintar();
    if (!focar) return;
    const alvo = caps[n]; const topo = alvo.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: Math.max(0, topo), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    alvo.querySelector('.corpo input, .corpo button, .corpo textarea')?.focus({ preventScroll: true });
  }

  btnAnterior.addEventListener('click', () => abrir(Math.max(0, atual - 1)));
  btnAvancar.addEventListener('click', () => {
    if (btnAvancar.dataset.aEnviar) return;
    if (atual < 4) {
      const e = validar(atual);
      if (Object.keys(e).length) return mostrarErros(e);
      caps[atual].dataset.estado = 'feito';
      return abrir(atual + 1);
    }
    enviar();
  });

  // ---------- envio ----------
  const iso = (txt) => {
    const m = txt.trim().match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return /^\d{4}-\d{2}-\d{2}$/.test(txt.trim()) ? txt.trim() : null;
  };
  const chamarRpc = async (fn, args) => {
    const r = await fetch(`${cfg.url}/rest/v1/rpc/${fn}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: cfg.anon, Authorization: `Bearer ${cfg.anon}` }, body: JSON.stringify(args),
    });
    if (!r.ok) {
      const corpo = await r.json().catch(() => null);
      const err = new Error(`${fn}: ${r.status} ${corpo?.message || ''}`.trim());
      err.codigo = corpo?.message || corpo?.hint || '';
      throw err;
    }
    return r.json();
  };
  const tipoDaApp = async () => {
    try {
      const tipos = await chamarRpc('tipos_de_evento_publicos', { p_tenant_slug: cfg.slug });
      const n = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/bapt/g, 'bat');
      const alvo = n(st.tipoNome).replace(/^outra celebracao$/, '');
      if (!alvo) return null;
      const achado = (tipos || []).find((t) => n(t.nome || '').includes(alvo) || alvo.includes(n(t.nome || '')));
      return achado?.id || null;
    } catch { return null; }
  };
  const payload = async () => {
    const contacto = st.contacto.trim();
    const dataIso = st.dataModo === 'aprox' ? iso(st.dataAprox) : iso(st.data);
    const respostas = { nomeDoCliente: st.nome.trim(), contactoPrincipal: contacto, localEvento: st.local.trim(), tipoLocal: st.tipoLocal, numeroConvidados: st.conv };
    if (dataIso) respostas.dataEvento = dataIso;
    if (st.whatsapp) respostas.numeroWhatsapp = contacto;
    const eventTypeId = cfg.url ? await tipoDaApp() : null;
    if (!eventTypeId) respostas.tipoEventoOutro = tipoTexto();
    const servicos = [];
    raiz.querySelectorAll('[data-campo="servicos"] [aria-pressed="true"]').forEach((b) => { if (b.dataset.rotulo) servicos.push(b.dataset.rotulo); });
    const balcao = [];
    st.complementares.forEach((id) => {
      const b = raiz.querySelector(`[data-campo="complementares"] [data-valor="${id}"]`);
      if (!b) return;
      if (b.dataset.servico && !servicos.includes(b.dataset.servico)) servicos.push(b.dataset.servico);
      if (b.dataset.balcao) balcao.push(b.dataset.balcao);
    });
    respostas.servicos = servicos;
    const rp = st.pacote ? rotuloPacoteParaPedido(st.pacote) : null;
    if (rp) respostas.servicosBuffet = [rp];
    if (balcao.length) respostas.servicosBalcao = balcao;
    if (st.canal) respostas.canalOrigem = st.canal;
    const notas = [
      dataIso ? '' : `Data aproximada: ${dataTexto()}`,
      st.mensagem.trim(),
      st.servicos.includes('buffet') && (st.pacote === '' || st.pacote === null) ? 'Medida do buffet ainda por decidir.' : '',
      'Pedido enviado pelo site.',
    ].filter(Boolean).join('\n');
    respostas.mensagemInicial = notas;
    return {
      p_payload: { nome: st.nome.trim(), contacto, whatsapp: st.whatsapp ? contacto : null, dataEvento: dataIso, numeroConvidados: st.conv, eventTypeId, respostas },
      p_tenant_slug: cfg.slug,
    };
  };
  const mensagemWa = () => `Olá! Enviei um pedido de orçamento pelo site: ${tipoTexto()}, ${dataTexto()}, ${st.local.trim()}, cerca de ${st.conv} convidados, ${servicosTexto()}${complementaresNomes().length ? ` + ${complementaresNomes().join(', ')}` : ''}. Sou ${st.nome.trim()}.`;
  const waHref = () => (cfg.wa ? `https://wa.me/${cfg.wa}?text=${encodeURIComponent(mensagemWa())}` : '');

  async function enviar() {
    const e = { ...validar(0), ...validar(1), ...validar(2), ...validar(3) };
    const primeiro = Object.keys(e)[0];
    if (primeiro) { const capComErro = [0, 1, 2, 3].find((n) => Object.keys(validar(n)).length); abrir(capComErro); return mostrarErros(validar(capComErro)); }
    const geral = $('[data-erro="geral"]'); geral.hidden = true;
    btnAvancar.setAttribute('aria-busy', 'true'); btnAvancar.dataset.aEnviar = '1'; rotulo.textContent = 'A enviar…';
    let resultado = null; let falhou = false;
    if (cfg.url && cfg.anon) {
      try { resultado = await chamarRpc('captacao_submeter', await payload()); }
      catch (err) { console.error('pedido:', err.codigo ? `${err.codigo} (verifique PUBLIC_TENANT_SLUG e a RPC)` : err); falhou = true; }
    } else { falhou = true; }
    btnAvancar.removeAttribute('aria-busy'); delete btnAvancar.dataset.aEnviar; rotulo.textContent = ROTULOS[4];
    if (falhou && !cfg.wa) {
      geral.textContent = 'Não foi possível enviar o pedido. Verifique a ligação e tente novamente.'; geral.hidden = false; geral.focus(); return;
    }
    // Sucesso — ou o caminho de recurso pelo WhatsApp, quando a rede falhou mas há número.
    form.hidden = true; raiz.querySelector('.abertura').hidden = true; barra.hidden = true; document.body.classList.remove('tem-barra');
    const conf = $('[data-confirmacao]'); conf.hidden = false;
    const txt = $('[data-confirm-txt]'); const wa = $('[data-wa-link]');
    if (falhou) {
      $('[data-confirm-ov]').textContent = 'Falta um passo';
      $('[data-confirm-h2]').textContent = 'Envie pelo WhatsApp.';
      $('[data-confirm-lead]').textContent = 'A ligação ao nosso sistema falhou, mas a mensagem já está pronta.';
      txt.textContent = 'Basta abrir o WhatsApp e enviar: respondemos por lá.';
    } else {
      txt.textContent = st.whatsapp ? 'A conversa continua no WhatsApp: guarde o nosso contacto e responda por lá quando der jeito.' : 'Entramos em contacto através do número indicado.';
    }
    if (waHref()) { wa.href = waHref(); wa.hidden = false; }
    desenharFolha($('[data-folha-final]'), false);
    try { sessionStorage.removeItem(CHAVE); } catch {}
    window.scrollTo({ top: 0, behavior: 'auto' });
    $('[data-confirm-h2]')?.focus?.();
  }

  // arranque — retoma no primeiro capítulo por completar, sem roubar o foco nem fazer scroll
  pintar(false);
  const inicio = !st.tipo ? 0 : Object.keys(validar(1)).length ? 1 : Object.keys(validar(2)).length ? 2 : 3;
  abrir(inicio, { focar: false });
}
