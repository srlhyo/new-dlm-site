import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// O pedido de orçamento só pode chegar à app real a partir do deploy de produção do Netlify
// (CONTEXT=production); local, deploy previews e branch deploys ficam no Supabase de staging.
const SUPABASE_PRODUCAO = 'uwhjblijvbscyzopeaiu';
const guardaSupabase = () => ({
  name: 'guarda-supabase',
  hooks: {
    'astro:config:setup': ({ command }) => {
      const env = loadEnv(command === 'dev' ? 'development' : 'production', process.cwd(), 'PUBLIC_');
      let ref = '';
      try { ref = new URL(env.PUBLIC_SUPABASE_URL).hostname.replace(/\.supabase\.co$/, ''); } catch {}
      const producao = process.env.CONTEXT === 'production';
      if (producao && ref !== SUPABASE_PRODUCAO) throw new Error(`Deploy de produção com PUBLIC_SUPABASE_URL fora do projecto de produção (${ref || 'vazio'}).`);
      if (!producao && ref === SUPABASE_PRODUCAO) throw new Error('PUBLIC_SUPABASE_URL aponta para produção fora do deploy de produção (CONTEXT=production).');
    },
  },
});

// Site estático: HTML pronto, imagens optimizadas no build, JS só onde há interacção.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://doluxoamesa.pt',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  fonts: [
    { provider: fontProviders.fontsource(), name: 'Playfair Display', cssVariable: '--font-display', weights: [400, 500, 600], styles: ['normal', 'italic'], subsets: ['latin', 'latin-ext'], fallbacks: ['Georgia', 'Times New Roman', 'serif'] },
    { provider: fontProviders.fontsource(), name: 'Instrument Sans', cssVariable: '--font-sans', weights: [400, 500, 600], styles: ['normal'], subsets: ['latin', 'latin-ext'], fallbacks: ['system-ui', 'Segoe UI', 'sans-serif'] },
  ],
  integrations: [guardaSupabase(), sitemap({ i18n: { defaultLocale: 'pt', locales: { pt: 'pt-PT', en: 'en' } } })],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
