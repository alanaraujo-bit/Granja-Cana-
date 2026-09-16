# Granja Canaã

Aplicativo de pedidos e entrega de ovos caipiras da Granja Canaã, em
Canaã dos Carajás. PWA instalável, feita para o celular.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
```

Outros comandos:

```bash
npm run build    # build de produção
npm start        # serve o build
npm run lint
npm run icons    # regera os ícones da PWA a partir de assets/icon-source.svg
npm run smoke    # percorre o fluxo de pedido em navegador real (servidor no ar)
npm run db:migrate  # aplica db/schema.sql no banco de .env.local
```

O service worker só é registrado em produção, para que o desenvolvimento
nunca seja servido a partir do cache.

## Como o projeto se organiza

```
app/            rotas (Home, pedido, checkout, confirmação, offline) e manifest
components/
  brand/        identidade — único lugar que precisa mudar quando o logo chegar
  order/        peças do fluxo de pedido
  screens/      as telas
  ui/           primitivos (botão, campo, cabeçalho, seletor de quantidade)
lib/            domínio: produtos, preços, faixas de entrega, carrinho, pedidos
db/             esquema do Postgres
assets/         fonte dos ícones
scripts/        geração de ícones
```

## Onde mexer

| Para mudar | Edite |
| --- | --- |
| Produtos e preços | `lib/products.ts` |
| Dias, horários e faixas de entrega | `lib/delivery.ts` |
| Cores, tipografia, raios, sombras, animações | bloco `@theme` em `app/globals.css` |
| Logomarca | `components/brand/Wordmark.tsx` e `assets/icon-source.svg` |

Preços são sempre inteiros em centavos e só viram texto em `lib/format.ts`.

## Infraestrutura

| Peça | Onde | Observação |
| --- | --- | --- |
| Código | GitHub `alanaraujo-bit/Granja-Cana-` | `main` é a branch de produção |
| App | Vercel, time `aionixdev`, projeto `granja-canaa` | push em `main` publica; outras branches geram preview |
| Banco | Railway, projeto `granja-canaa`, serviço `Postgres` | pedidos em `orders` e `order_items` |

O mesmo Postgres guarda dois bancos, e `DATABASE_URL` na Vercel aponta para
cada um pela URL pública do proxy TCP (o endereço `*.railway.internal` não é
alcançável de fora da Railway):

| Ambiente Vercel | Banco |
| --- | --- |
| Production | `railway` — pedidos reais |
| Preview e Development | `granja_dev` — testes |

Para trabalhar localmente: `vercel env pull .env.local` (traz o `granja_dev`).

Mudou `db/schema.sql`? Aplique nos dois bancos **antes** de publicar:

```bash
npm run db:migrate                                # granja_dev
DATABASE_URL="<url de produção>" npm run db:migrate   # railway
```

## Documentos

- `PROGRESS.md` — estado do produto e as decisões por trás dele
- `BLOCKERS.md` — o que depende de material ou definição da granja

## Escopo desta fase

O cliente navega, escolhe, monta o pedido e o pedido é gravado no Postgres.
**Nenhuma cobrança é feita e a granja ainda não é avisada** — não há painel
nem notificação.

Autenticação, pagamento, rastreamento, painel administrativo e
módulo do entregador ficaram fora desta fase, de propósito. A base está
preparada para recebê-los.
