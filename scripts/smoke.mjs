/**
 * Teste de fumaça do fluxo de pedido, em navegador real.
 *
 * Percorre Home → pedido → checkout → confirmação exatamente como um cliente
 * faria e falha se algo se quebrar pelo caminho: erro de console, requisição
 * falha, rolagem horizontal ou fluxo que não chega ao fim. Com DATABASE_URL
 * disponível (.env.local), confere também que o pedido exibido foi gravado
 * no banco com o total certo.
 *
 *   npm run dev          (em outro terminal)
 *   npm run smoke
 *
 * Aceita outra origem: `npm run smoke -- http://localhost:3100`.
 *
 * Com o banco disponível, cada pedido criado é apagado logo após a conferência,
 * então o teste pode rodar contra produção sem deixar rastro. Sem banco, os
 * pedidos ficam com o nome SMOKE_NAME para limpeza manual.
 */
import { chromium } from "playwright";
import pg from "pg";

const SMOKE_NAME = "Teste de fumaça";
const db = process.env.DATABASE_URL
  ? new pg.Client({ connectionString: process.env.DATABASE_URL })
  : null;
await db?.connect();

const BASE = process.argv[2] ?? "http://localhost:3000";
const VIEWPORTS = [
  { name: "celular pequeno", width: 360, height: 640 },
  { name: "celular grande", width: 430, height: 932 },
  { name: "desktop", width: 1440, height: 900 },
];

const problems = [];
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.width < 700,
    hasTouch: vp.width < 700,
  });
  const page = await context.newPage();
  const note = (m) => problems.push(`[${vp.name}] ${m}`);

  page.on("console", (m) => {
    if (m.type() === "error") note(`erro de console: ${m.text().slice(0, 200)}`);
  });
  page.on("pageerror", (e) => note(`exceção: ${e.message.slice(0, 200)}`));
  page.on("requestfailed", (r) => {
    const reason = r.failure()?.errorText ?? "";
    // Navegar cancela o que ainda está em trânsito (prefetch, cauda da resposta
    // da action). Isso é o navegador trabalhando, não uma falha.
    if (reason.includes("ERR_ABORTED")) return;
    note(`requisição falhou: ${r.method()} ${r.url()} (${reason})`);
  });

  const checkOverflow = async (screen) => {
    const extra = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (extra > 0) note(`${screen}: rolagem horizontal de ${extra}px`);
  };

  try {
    await page.goto(BASE, { waitUntil: "networkidle" });
    await checkOverflow("Home");

    // Escolhe a bandeja de 15, aumenta para 2 e adiciona ao pedido.
    const card = page.locator("article").nth(1);
    await card.getByLabel(/Aumentar quantidade/).click();
    await card.getByRole("button", { name: /Adicionar/ }).click();

    await page.getByRole("link", { name: /Ver pedido/ }).click();
    await page.waitForURL("**/pedido");
    await checkOverflow("Pedido");

    await page.getByRole("button", { name: /Escolher entrega/ }).click();
    await page.waitForURL("**/checkout");
    await checkOverflow("Checkout");

    // Finalizar sem preencher precisa barrar e apontar o que falta.
    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await page.waitForTimeout(400);
    if (!page.url().includes("/checkout")) note("checkout avançou sem validar os campos");
    const alerts = await page.getByRole("alert").count();
    if (alerts < 4) note(`esperava 4 mensagens de erro, encontrei ${alerts}`);

    await page.getByLabel("Nome").fill(SMOKE_NAME);
    await page.getByLabel("Endereço de entrega").fill("Rua das Palmeiras, 240 — Novo Horizonte");
    await page.getByRole("radio", { name: /h às/ }).first().click();
    await page.getByRole("radio", { name: /Dinheiro/ }).click();
    await page.getByLabel(/troco para quanto/).fill("50");

    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await page.waitForURL("**/confirmacao", { timeout: 15000 });
    await checkOverflow("Confirmação");

    const code = await page.locator("[data-selectable]").first().textContent();
    if (!/^GC-\d{4}$/.test((code ?? "").trim())) note(`código de pedido inesperado: ${code}`);
    if (!(await page.getByText("R$ 32,00").first().isVisible())) note("total ausente na confirmação");

    if (db) {
      const { rows } = await db.query(
        `select o.total_cents, o.customer_name, sum(i.unit_price_cents * i.qty)::int as items_cents
           from orders o join order_items i on i.order_id = o.id
          where o.code = $1 group by o.id`,
        [code?.trim()],
      );
      try {
        if (rows.length !== 1) note(`pedido ${code} não foi gravado no banco`);
        else if (rows[0].total_cents !== 3200 || rows[0].items_cents !== 3200)
          note(`pedido ${code} gravado com total ${rows[0].total_cents} e itens ${rows[0].items_cents}`);
      } finally {
        await db.query("delete from orders where code = $1 and customer_name = $2", [
          code?.trim(),
          SMOKE_NAME,
        ]);
      }
    }

    // Recarregar a confirmação não pode expulsar o cliente do pedido.
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    if (!page.url().includes("/confirmacao")) note("recarregar a confirmação perdeu o pedido");
  } catch (error) {
    note(`fluxo interrompido: ${String(error).split("\n")[0]}`);
  }

  await context.close();
}

await browser.close();
await db?.end();

if (problems.length > 0) {
  console.error("Falhas encontradas:\n" + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log(`Fluxo de pedido OK em ${VIEWPORTS.length} tamanhos de tela.`);
