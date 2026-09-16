# Progresso — Granja Canaã

Registro vivo do estado do produto e das decisões tomadas. Serve para retomar
o trabalho sem precisar reconstruir o raciocínio.

---

## Estado atual

**Fase 1 — primeira experiência do cliente: concluída.**

Fluxo completo e navegável: Home → resumo do pedido → entrega e pagamento →
confirmação. Validado em navegador real (Chromium, Playwright) de ponta a
ponta, em cinco larguras.

### Telas entregues

| Rota | Tela | Papel |
| --- | --- | --- |
| `/` | Home | Peça principal. Marca, contexto, entrega, produtos, início do pedido. |
| `/pedido` | Resumo | Conferência, quantidade, remoção, totais. Tem estado vazio e de carregamento. |
| `/checkout` | Entrega e pagamento | Dados, faixa de horário, forma de pagamento, validação. |
| `/confirmacao` | Confirmação | Código do pedido, resumo e feedback de sucesso. |
| `/offline` | Fallback | Usada pelo service worker quando não há rede. |

---

## Decisões

### Stack
Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, Zustand.
Next foi escolhido em vez de um SPA puro porque as evoluções previstas
(pedidos no servidor, painel, autenticação) entram sem troca de fundação.

### Tailwind v4 é CSS-first
Não existe `tailwind.config.js`. Todos os tokens vivem em `@theme`, dentro de
`app/globals.css`. Alterar cor, raio, sombra ou tempo de animação é editar
aquele bloco — nenhum valor de marca está espalhado pelos componentes.

### Dinheiro em centavos inteiros
Preços circulam como `number` em centavos e só viram texto em
`lib/format.ts`, via `Intl.NumberFormat('pt-BR')`. Evita erro de ponto
flutuante em somas de pedido.

### Faixas de entrega calculadas, nunca fixas
`lib/delivery.ts` deriva os dias e horários a partir da hora real: respeita
terça a domingo, 08h–16h, esconde faixas do dia cujo início já passou e
avança sozinho para o próximo dia aberto. Numa segunda-feira, a primeira
opção oferecida é terça — sem nenhuma lista codificada à mão.

### Hora é estado do cliente
Saudação, status de aberto/fechado e faixas de entrega são calculados dentro
de `useEffect`, nunca na renderização do servidor. Calcular no servidor daria
um texto errado e divergência de hidratação. Onde o valor ainda não chegou, o
espaço final já está reservado — nada se desloca ao carregar.

### Carrinho persistido com hidratação manual
`lib/cart-store.ts` usa `persist` com `skipHydration: true`; a leitura do
`localStorage` é disparada em `<CartHydration/>` após a montagem. Toda tela
que decide algo com base no carrinho usa `useCartHydrated()` — antes da
hidratação o carrinho parece vazio, e agir nesse instante expulsaria o
cliente de um pedido que ele de fato tem.

O store também expõe um `storage` neutro no servidor: sem ele o middleware
não chega a anexar `store.persist` e o build estático quebra.

### Um único scroll
O documento é o que rola. A única rolagem interna é a faixa de dias no
checkout, onde ela é o padrão nativo esperado. Nada de scrolls concorrentes.

### Sem fotografia
Não há material oficial da marca (ver `BLOCKERS.md`). Em vez de banco de
imagens — caminho mais curto para aparência de template — a identidade é
construída com tipografia, cor e espaço. A contagem de ovos virou o elemento
visual do card, porque é a informação que o cliente procura.

### Estados de carregamento só onde há espera real
O único `loading` encenado é o envio do pedido. Colocar *skeleton* sobre
dados locais instantâneos seria teatro; os *skeletons* que existem cobrem
esperas verdadeiras (leitura do `localStorage`, cálculo de faixas no cliente).

### Navegação sem abas
Com quatro superfícies não existe conteúdo legítimo para uma barra de abas.
A Home é a superfície principal, o pedido é alcançado por uma barra fixa
inferior, e checkout e confirmação são rotas empilhadas com retorno no
cabeçalho.

---

## Comportamento nativo

Concentrado em `app/globals.css` (base e utilitários) e no `viewport` de
`app/layout.tsx`:

- `viewportFit: cover` + `env(safe-area-inset-*)` em toda superfície fixa —
  é o que impede o botão principal de ficar sob a barra de gestos.
- `100dvh` em vez de `100vh`.
- Zoom de foco no iOS resolvido pelo tamanho real dos campos (16px), não só
  por `maximumScale`.
- Sem barras de rolagem visíveis, sem realce de toque, sem seleção de texto
  no cromo da interface — e com `[data-selectable]` devolvendo a seleção onde
  o cliente pode precisar copiar (código do pedido, endereço).
- `overscroll-behavior: none`, alvos de toque de 44px, retorno de pressão em
  tudo que é tocável, `prefers-reduced-motion` respeitado.
- Hover nunca é requisito de interação.

## PWA

`app/manifest.ts` gera o manifest; `public/sw.js` faz rede-primeiro para
navegação e cache-primeiro para estáticos, com fallback para `/offline`.
O service worker só é registrado em produção, para não servir versão velha
durante o desenvolvimento.

Os ícones são gerados por `npm run icons` a partir de
`assets/icon-source.svg`, incluindo as variantes `maskable` e o
`apple-touch-icon` (o iOS ignora os ícones do manifest).

---

## Pedidos no servidor

Finalizar o pedido chama a Server Action `placeOrder`
(`lib/order-actions.ts`), que grava em `orders` e `order_items` numa
transação. O carrinho só é esvaziado depois que o servidor confirma; em
falha, o cliente vê a mensagem e continua com o pedido montado.

### O servidor não confia no cliente
A action é alcançável por POST direto. O cliente envia só produtos,
quantidades, dados de entrega e o id da faixa. Preço, total, rótulo da faixa
e código do pedido são decididos no servidor, a partir de `lib/products.ts`.

### Preço congelado por item
`order_items` guarda nome e preço unitário do momento da compra. Mudar o
catálogo não reescreve pedidos antigos.

### Relógio da granja
A Vercel roda em UTC; um celular pode estar em outro fuso. `granjaNow()`
(`lib/delivery.ts`) devolve a hora de Canaã (America/Belem), e tanto a tela
quanto a action usam esse valor. Sem isso, das 21h à meia-noite o servidor
já estaria "amanhã" e recusaria faixas válidas.

### Código do pedido
Continua `GC-` + 4 dígitos, fácil de ditar. É sorteado no servidor e único
no banco; em colisão, sorteia outro. São 9.000 códigos — quando o volume se
aproximar disso, aumentar para 5 dígitos.

## Fora do escopo desta fase

Autenticação, gateway de pagamento, rastreamento, painel
administrativo e módulo do entregador — conforme o briefing. A base está
preparada para recebê-los, mas nada fictício foi construído.

## Próximos passos naturais

1. Substituir a identidade provisória pelo material oficial
   (`components/brand/Wordmark.tsx` e `assets/icon-source.svg`).
2. Avisar a granja de cada pedido novo (painel ou notificação).
3. Enviar a confirmação ao cliente.
4. Histórico de pedidos, lido de `orders`.
5. Limitar envios por IP antes de divulgar: a action é pública.
