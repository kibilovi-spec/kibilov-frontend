const { chromium } = require('playwright');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const db = new Client({ host: '127.0.0.1', database: 'kibilov_db', user: 'postgres', password: 'Anarkia199090' });
  await db.connect();
  
  const { rows } = await db.query(`SELECT id, sku FROM products WHERE sku ~ '^(LF|MF|OF|KF)' AND (images IS NULL OR array_length(images,1) IS NULL OR array_length(images,1) = 0) LIMIT 20`);
  console.log(`Products: ${rows.length}`);

  const browser = await chromium.launch({ headless: true });
  const saveDir = '/var/www/kibilov-frontend/public/images/products/';
  fs.mkdirSync(saveDir, { recursive: true });

  let ok = 0, fail = 0;
  for (const { id, sku } of rows) {
    const skuClean = sku.trim().replace(/\s+/g, '');
    try {
      const page = await browser.newPage();
      let imgUrl = null;
      page.on('response', async res => {
        const url = res.url();
        if (url.includes('/imgbank/') && (url.endsWith('.jpg') || url.endsWith('.png')) && !url.includes('banner') && !url.includes('category')) {
          imgUrl = url;
        }
      });
      await page.goto(`https://wunscher.de/en/?action=iCatalog&number=${skuClean}&type=article`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.close();
      
      if (imgUrl) {
        const res = await fetch(imgUrl);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 5000) {
          const fname = `${skuClean}.jpg`;
          fs.writeFileSync(path.join(saveDir, fname), buf);
          await db.query(`UPDATE products SET images = $1, image_status = 'REAL' WHERE id = $2`, [[`/images/products/${fname}`], id]);
          ok++;
          console.log(`✅ ${sku} → ${imgUrl}`);
        } else { fail++; }
      } else { fail++; console.log(`❌ ${sku} no image`); }
    } catch(e) { fail++; console.log(`❌ ${sku} ${e.message}`); }
  }
  
  await browser.close();
  await db.end();
  console.log(`Done: ok=${ok} fail=${fail}`);
}
main();
