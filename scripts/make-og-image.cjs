// Gera public/og-image.png (1200x630) — o card que aparece ao compartilhar o
// site no WhatsApp, LinkedIn, X etc. Roda com: node scripts/make-og-image.cjs
//
// Usa a foto de perfil e a mesma paleta do site. Refazer só quando mudar nome,
// cargo, stack ou domínio.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/og-image.png');
const SITE_URL = (process.env.VITE_SITE_URL || 'https://erik-efl.github.io/Portifolio')
  .replace(/^https?:\/\//, '')
  .replace(/\/+$/, '');

const photo = fs.readFileSync(path.join(ROOT, 'src/assets/Image/perfil.webp')).toString('base64');

const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" />
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px; overflow:hidden; position:relative;
    background:#0C0C0C; font-family:'DejaVu Sans', sans-serif; color:#FBFBFB;
  }
  .glow {
    position:absolute; width:820px; height:820px; right:-260px; top:-140px;
    background:radial-gradient(circle, rgba(255,203,4,0.20) 0%, rgba(255,203,4,0.06) 42%, transparent 68%);
  }
  .rule { position:absolute; left:72px; top:96px; width:64px; height:6px; background:#FFCB04; border-radius:3px; }
  .eyebrow {
    position:absolute; left:72px; top:130px; font-size:20px; letter-spacing:6px;
    text-transform:uppercase; color:#FFCB04; font-weight:700;
  }
  .name { position:absolute; left:72px; top:186px; font-size:74px; line-height:1.02; font-weight:700; letter-spacing:-1.5px; }
  .role { position:absolute; left:72px; top:360px; font-size:34px; color:#D6D6D6; }
  .stack { position:absolute; left:72px; top:424px; font-size:23px; color:#8E8E8E; letter-spacing:0.4px; }
  .url { position:absolute; left:72px; bottom:64px; font-size:21px; color:#8E8E8E; letter-spacing:0.6px; }
  .url b { color:#FBFBFB; font-weight:700; }
  .avatarWrap { position:absolute; right:78px; top:50%; transform:translateY(-50%); width:392px; height:392px; }
  .ring {
    position:absolute; inset:0; border-radius:50%;
    background:linear-gradient(145deg, rgba(255,203,4,0.95), rgba(255,203,4,0.22) 55%, rgba(255,255,255,0.10));
  }
  .avatar {
    position:absolute; inset:7px; border-radius:50%; overflow:hidden;
    border:8px solid #0C0C0C; background:#1E1E1F;
  }
  .avatar img { width:100%; height:100%; object-fit:cover; object-position:50% 22%; transform:scale(1.06); }
</style></head>
<body>
  <div class="glow"></div>
  <div class="rule"></div>
  <div class="eyebrow">Portfólio</div>
  <div class="name">Erik Ferreira<br/>Lima</div>
  <div class="role">Desenvolvedor full stack</div>
  <div class="stack">React · React Native · Node.js · TypeScript</div>
  <div class="url"><b>${SITE_URL}</b></div>
  <div class="avatarWrap">
    <div class="ring"></div>
    <div class="avatar"><img src="data:image/webp;base64,${photo}" alt="" /></div>
  </div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1
  });
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(200);
  await page.screenshot({ path: OUT, type: 'png' });
  await browser.close();

  const { size } = fs.statSync(OUT);
  console.log(`public/og-image.png gerado (${(size / 1024).toFixed(1)} kB) — ${SITE_URL}`);
})();
