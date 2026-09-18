# Do Luxo à Mesa — site público

Site estático em [Astro](https://astro.build): HTML pronto no build, imagens
optimizadas (webp + srcset), fontes descarregadas no build e servidas do próprio
domínio com preload (API de fontes do Astro, fornecedor Fontsource — o build
precisa de rede), JavaScript só onde há interacção. Direcção criativa «Living Composition» — ver a exploração no canvas
de design e o `src/styles/global.css` para os tokens.

## Correr

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # produção → dist/
npm run preview  # servir o build
```

## Variáveis de ambiente (`.env`, ver `.env.example`)

| variável | para quê |
|---|---|
| `PUBLIC_SUPABASE_URL` · `PUBLIC_SUPABASE_ANON_KEY` | o pedido de orçamento entra directamente na app de gestão (`dlm-producao`) pela RPC `captacao_submeter`, a mesma porta que `/interesse/:slug` usa |
| `PUBLIC_TENANT_SLUG` | a casa: `doluxoamesa` |
| `PUBLIC_WHATSAPP` | número em formato internacional sem `+` (ex: `351912345678`). Sem número, as ligações de WhatsApp não aparecem (nunca apontam para outro sítio com o nome errado) |
| `PUBLIC_INSTAGRAM` | a conta, sem `@` |
| `PUBLIC_EMAIL` · `PUBLIC_SITE_URL` | rodapé, canonical e Open Graph |

Sem Supabase configurado, o pedido continua a funcionar: compõe a mensagem e
abre o WhatsApp (se houver número). Com Supabase, o pedido nasce na app em fase
«interessado»; um pedido repetido (mesmo telefone e data) não cria outro e a
página não o revela ao visitante.

⚠ Durante a revisão automática de 18/09/2026 foi enviado pelo menos um pedido de
teste real ao Supabase de produção (nome de teste, tipo Batizado). Apagar na app.

## Onde vive o conteúdo

- **Pacotes de buffet**: `src/data/pacotes.js` — espelho de
  `dlm-producao/src/components/captacao/pacotesBuffet.js`. Se a carta mudar,
  muda-se nos dois sítios.
- **Taxonomia dos serviços** (os rótulos que o pedido envia à app):
  `src/data/servicos.js` — tem de coincidir com `CaptacaoForm.jsx`.
- **Contactos e navegação**: `src/data/site.js`.
- **Copy**: nos componentes, em português de Portugal (AO90), terceira pessoa.
- **Fotografia**: `src/assets/img/` (recortes curados a partir de
  `videos_images.zip`); vídeo em `src/assets/video/` (8 s, sem som, MP4, URL
  com hash). Os vídeos só tocam quando entram no ecrã, nunca com
  `prefers-reduced-motion` nem com poupança de dados, e têm botão de pausa.

## Estrutura

```
src/pages/            index · buffet-catering · mesa-posta · pedir-orcamento · privacidade · 404
src/components/home/  as composições da homepage (uma por capítulo)
src/components/buffet/
src/scripts/motion.js os cinco verbos de movimento (reveal, compose, focus, depth, transform)
src/scripts/pedido.js o fluxo de pedido de orçamento (capítulos, validação, envio)
```

## Publicar

Build estático — Netlify, Vercel ou qualquer alojamento de ficheiros.
`public/_headers` traz a cache dos assets para Netlify. Antes de publicar:
preencher `.env` no alojamento, indicar o número de WhatsApp e a conta de
Instagram, substituir os textos entre `[parênteses rectos]` (testemunhos,
privacidade) e confirmar as fotografias atribuídas a batizado, noivado e chá
de bebé.

## Inglês

A estrutura de i18n do Astro está preparada (`pt` por omissão, `en` sem
prefixo obrigatório). A versão inglesa duplica as páginas em `src/pages/en/`
quando for altura.
