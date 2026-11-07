# MinducoLabs — Catálogo de Impressão 3D (React)

Catálogo web da MinducoLabs em Vite + React 18, pronto para publicar na Vercel.

- 62 produtos em 9 coleções (Decoração & Vasos, Natal, Japandi & Minimalista,
  Bebê & Maternidade, Pet, Casal & Casamento, Articulados & Fidgets,
  Utilidades e Personalizados), com busca, filtro por coleção e ficha do produto.
- Carrinho em drawer com quantidades e total; checkout abre o WhatsApp
  +55 11 94585-3707 com o pedido já estruturado.
- Preços, gramas e tempos extraídos do catálogo publicado (export
  `minducolabs.html`); fotos em `public/images/` (JPEG, máx. 900 px).
- Peças em cinza, preto ou branco; as maiores são montadas com várias partes,
  cada parte em 1 cor, sem AMS.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy (Vercel)

O projeto usa o `vercel.json` com `{"framework": "vite"}` — basta importar o
repositório na Vercel (ou `vercel` na CLI). Nenhuma variável de ambiente é
necessária.
