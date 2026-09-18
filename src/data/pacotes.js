// ============================================================
// Os pacotes de buffet — espelho de dlm-producao/src/components/
// captacao/pacotesBuffet.js (a fonte única da app, carta de 09/09/2026).
// Se a carta mudar, muda-se lá E aqui, para o site e o pedido nunca
// dizerem coisas diferentes. Conteúdo verbatim do PDF.
// ============================================================

const OFERTA_BASE = [
  'Decoração incluída',
  'Bebida não alcoólica servida em copos decorativos',
  'Água aromatizada como elemento decorativo da mesa',
];

export const PACOTES = [
  {
    id: 'essence',
    nome: 'Essence',
    detalhe: 'até 18 convidados',
    maxConvidados: 18,
    preco: 450,
    tagline: 'A mesa essencial para uma celebração simples e elegante.',
    mesa: 'Mesa de 180 cm',
    mesaCm: 180,
    pecas: '250 peças',
    inclui: [
      'Mini sobremesas variadas',
      'Brigadeiros',
      'Mini salgados variados',
      'Mini hambúrgueres gourmet',
      'Mini cachorros gourmet',
      'Mini pizzas',
      'Cones de fruta / enchidos',
      'Donuts personalizados',
      'Mini barquinhos com asas de frango e chips',
    ],
    oferta: OFERTA_BASE,
  },
  {
    id: 'supreme',
    nome: 'Supreme',
    detalhe: 'até 35 convidados',
    maxConvidados: 35,
    preco: 650,
    maisEscolhido: true,
    tagline: 'O equilíbrio ideal entre mesa, variedade e apresentação.',
    mesa: 'Mesa de 360 cm',
    mesaCm: 360,
    pecas: '450 peças',
    inclui: [
      'Mini sobremesas',
      'Brigadeiros',
      'Donuts personalizados',
      'Mini salgados variados',
      'Mini hambúrgueres gourmet',
      'Mini cachorros gourmet',
      'Mini pizzas',
      'Mini barquinhos com asas de frango e chips',
      'Cones de fruta / enchidos',
      'Crepes primavera',
      'Copos de salada César',
    ],
    oferta: OFERTA_BASE,
  },
  {
    id: 'premium',
    nome: 'Premium',
    detalhe: 'até 50 convidados',
    maxConvidados: 50,
    preco: 920,
    tagline: 'Serviço completo, com acompanhamento do buffet do início ao fim.',
    mesa: 'Mesa de 360 cm',
    mesaCm: 360,
    pecas: '650 peças',
    inclui: [
      'Brigadeiros',
      'Sobremesas de copo',
      'Donuts personalizados',
      'Mini salgados variados',
      'Mini hambúrgueres gourmet',
      'Mini cachorros gourmet',
      'Mini pizzas',
      'Mini barquinhos com asas de frango e chips',
      'Crepes primavera',
      'Cones de fruta e enchidos',
      'Mini wraps de frango',
      'Saladas frias',
      'Mini copos de salada César',
      'Saladas frias de grão com bacalhau',
      'Canapés diversos',
      'Camarões panados em molho agridoce',
    ],
    oferta: [...OFERTA_BASE, '2 elementos de staff para serviço e reposição durante o evento'],
  },
];

export const PERSONALIZADO = { id: 'personalizado', nome: 'Personalizado', detalhe: 'mais de 50 convidados' };

export const formatarPreco = (n) => `${n}€`;

// O pacote sugerido para um nº de convidados — null sem número válido.
export const pacoteSugerido = (numeroConvidados) => {
  const n = Number(numeroConvidados);
  if (!String(numeroConvidados ?? '').trim() || !Number.isFinite(n) || n < 1) return null;
  const cabe = PACOTES.find((p) => n <= p.maxConvidados);
  return cabe ? cabe.nome : PERSONALIZADO.nome;
};

// O que a app guarda em respostas.servicosBuffet: "Nome (detalhe)".
export const rotuloPacoteParaPedido = (nome) => {
  const p = PACOTES.find((x) => x.nome === nome) || (nome === PERSONALIZADO.nome ? PERSONALIZADO : null);
  return p ? `${p.nome} (${p.detalhe})` : null;
};
