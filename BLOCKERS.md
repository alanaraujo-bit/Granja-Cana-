# Bloqueios — Granja Canaã

Registro de itens que dependem de ação, credencial ou informação da sua parte.
Nada aqui impediu o andamento do restante do projeto.

---

## 1. Assets oficiais da marca ausentes

**Status:** bloqueado — aguardando material
**Impacto:** baixo (contornado)

O diretório do projeto estava vazio no início desta fase. As "referências
fornecidas" citadas no briefing não existiam no repositório, portanto **nenhuma
referência visual real da Granja Canaã foi utilizada**. A identidade foi
construída a partir de tipografia, cor e espaçamento, seguindo a descrição da
marca no briefing.

**O que falta:**
- Logomarca oficial em vetor (SVG preferencial, ou PNG com fundo transparente)
- Fotografias reais da produção, dos ovos e da granja
- Confirmação das cores oficiais, caso existam

**O que será feito quando o material chegar:**
- O componente `components/brand/Wordmark.tsx` é o único ponto de troca da
  identidade. Ele renderiza o nome tipograficamente hoje e foi escrito para
  aceitar um `<Image>` no lugar sem alterar nenhuma outra tela.
- Os ícones da PWA são gerados por `scripts/generate-icons.mjs` a partir de
  `assets/icon-source.svg`. Substituir esse SVG e rodar `npm run icons`
  regenera todos os tamanhos.
- Nenhuma fotografia de banco de imagens foi usada, de propósito: imagem
  genérica é o caminho mais rápido para o produto parecer template.

---

## 2. Dados da operação a confirmar

**Status:** assumido — revisar com a proprietária
**Impacto:** baixo

Valores adotados a partir do briefing, sem confirmação direta:

- Faixas de entrega definidas como 08–10h, 10–12h, 12–14h e 14–16h, dentro da
  janela de terça a domingo, 08h–16h. O briefing cita "horários organizados por
  faixas" sem especificar o recorte.
- Pedido mínimo: nenhum (não informado).
- Área de cobertura: Canaã dos Carajás, sem subdivisão por bairro.
- Prazo de corte para pedidos do mesmo dia: a faixa é ocultada assim que seu
  horário de início passa. Regra escolhida por ser a mais previsível.

Se algum desses pontos divergir da operação real, o ajuste é isolado em
`lib/delivery.ts`.
