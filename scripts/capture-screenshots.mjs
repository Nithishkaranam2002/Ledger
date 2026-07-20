import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.LEDGER_URL ?? "https://ledger-rho-vert.vercel.app";
const out = path.join(__dirname, "../public/screenshots");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

async function shot(name) {
  const file = path.join(out, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("wrote", file);
}

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await shot("dashboard-preparer.png");

// Admin view via the role <select>
await page.locator('select').first().selectOption("user-priya");
await page.waitForTimeout(800);
await shot("dashboard-admin.png");

// Back to preparer
await page.locator("select").first().selectOption("user-sarah");
await page.waitForTimeout(500);

await page.goto(`${BASE}/returns/return-01`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await shot("return-review.png");

await page
  .getByRole("button", { name: /Wages, Salaries/i })
  .getByRole("button", { name: /View source/i })
  .click();
await page.waitForTimeout(900);
await shot("source-trace.png");
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

await page.goto(`${BASE}/returns/return-01?tab=flags&flag=flag-01`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(1200);
await shot("ai-review.png");
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

await page.goto(`${BASE}/returns/return-01?tab=requests`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(900);
await shot("collaboration.png");

await browser.close();
console.log("done");
