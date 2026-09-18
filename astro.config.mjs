import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
  integrations: [sitemap({ i18n: { defaultLocale: 'pt', locales: { pt: 'pt-PT', en: 'en' } } })],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
