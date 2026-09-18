// ============================================================
// A taxonomia dos serviços — a MESMA que a app usa em
// dlm-producao/src/components/captacao/CaptacaoForm.jsx
// (OPCOES_SERVICOS, OPCOES_BALCAO, OPCOES_LOCAL). Os rótulos que o
// site envia no pedido têm de existir tal e qual do lado da app.
// ============================================================

export const OPCOES_SERVICOS = ['Mesa posta', 'Buffet', 'Cenário fotografável', 'Mesa do bolo', 'Balcão'];
export const OPCOES_BALCAO = ['Welcome Drink', 'Bar & Cocktail', 'Doces', 'Hambúrgueres & Cachorro'];
export const OPCOES_LOCAL = ['Ao domicílio', 'Salão', 'Quinta', 'Exterior', 'Outro'];

// Como o site apresenta os serviços principais e complementares, e o
// que cada escolha escreve no pedido (chaves da app).
export const SERVICOS_PRINCIPAIS = [
  { id: 'mesa-posta', nome: 'Mesa Posta', sub: 'Mesa composta peça a peça, montada no local', servico: 'Mesa posta' },
  { id: 'buffet', nome: 'Buffet & Catering', sub: 'Mesa própria, decoração incluída', servico: 'Buffet' },
];

export const COMPLEMENTARES = [
  { id: 'mesa-do-bolo', nome: 'Mesa de bolo', servico: 'Mesa do bolo' },
  { id: 'cenario', nome: 'Mesa de memórias / cenário', servico: 'Cenário fotografável' },
  { id: 'welcome-drink', nome: 'Welcome Drink', servico: 'Balcão', balcao: 'Welcome Drink' },
  { id: 'bar', nome: 'Bar & cocktails', servico: 'Balcão', balcao: 'Bar & Cocktail' },
  { id: 'doces', nome: 'Balcão de doces', servico: 'Balcão', balcao: 'Doces' },
  { id: 'hamburgueres', nome: 'Hambúrgueres & cachorros', servico: 'Balcão', balcao: 'Hambúrgueres & Cachorro' },
];

export const CANAIS = ['Instagram', 'Facebook', 'WhatsApp', 'Recomendação', 'Pesquisa Google', 'Outro'];
