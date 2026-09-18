// robots.txt gerado a partir do domínio configurado (PUBLIC_SITE_URL), para o sitemap apontar sempre para o sítio certo.
export function GET({ site }) {
  const base = site ? site.href.replace(/\/$/, '') : '';
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap-index.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
