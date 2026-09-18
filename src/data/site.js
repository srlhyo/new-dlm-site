// Dados da casa que o site inteiro lê. Os contactos vêm do .env para
// nunca ficarem inventados no código.
const env = import.meta.env;

export const CASA = {
  nome: 'Do Luxo à Mesa',
  assinatura: 'Do Luxo à Mesa · by Luxury Events',
  zona: 'Lisboa e arredores',
  whatsapp: (env.PUBLIC_WHATSAPP || '').replace(/\D/g, ''), // 351912345678
  instagram: (env.PUBLIC_INSTAGRAM || '').replace(/^@/, ''),
  email: env.PUBLIC_EMAIL || '',
  site: env.PUBLIC_SITE_URL || 'https://doluxoamesa.pt',
};

// Ligação de WhatsApp com mensagem opcional. Sem número configurado,
// aponta para a página do pedido — nunca para um número inventado.
export const whatsappHref = (texto = '') => {
  if (!CASA.whatsapp) return '/pedir-orcamento';
  const q = texto ? `?text=${encodeURIComponent(texto)}` : '';
  return `https://wa.me/${CASA.whatsapp}${q}`;
};

export const instagramHref = () => (CASA.instagram ? `https://instagram.com/${CASA.instagram}` : null);

export const NAV = [
  { label: 'Mesa Posta', href: '/mesa-posta' },
  { label: 'Buffet & Catering', href: '/buffet-catering' },
  { label: 'Serviços', href: '/#servicos' },
  { label: 'Celebrações', href: '/#celebracoes' },
  { label: 'Como trabalhamos', href: '/#como' },
];

export const CELEBRACOES = [
  { id: 'casamento', nome: 'Casamento', plural: 'Casamentos' },
  { id: 'batizado', nome: 'Batizado', plural: 'Batizados' },
  { id: 'aniversario', nome: 'Aniversário', plural: 'Aniversários' },
  { id: 'noivado', nome: 'Noivado', plural: 'Noivados' },
  { id: 'cha-de-bebe', nome: 'Chá de bebé', plural: 'Chás de bebé' },
  { id: 'outra', nome: 'Outra celebração', plural: 'Outras celebrações' },
];
