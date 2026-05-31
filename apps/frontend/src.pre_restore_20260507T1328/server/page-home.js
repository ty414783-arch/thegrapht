export const buildHomeHtml = ({
  inter400Url,
  inter500Url,
  inter600Url,
  inter700Url,
  inter800Url,
  logoDataUrl
}) => `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TheGraphT - Secure Messaging Platform</title>
    <meta name="description" content="TheGraphT: платформа защищенного общения с прозрачной архитектурой безопасности." />
    <style>
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 400; src: url("${inter400Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 500; src: url("${inter500Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 600; src: url("${inter600Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 700; src: url("${inter700Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 800; src: url("${inter800Url}") format("truetype"); }
      :root {
        --bg: #f4f6fa;
        --ink: #0f1a2b;
        --ink-soft: #45546c;
        --line: #cdd8ea;
        --blue: #006fde;
        --aqua: #00bbd4;
        --card: #ffffffd6;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; font-family: "Inter", sans-serif; color: var(--ink); background: var(--bg); scroll-behavior: smooth; }
      body {
        background:
          radial-gradient(circle at 12% 9%, rgba(0,111,222,.11), transparent 28%),
          radial-gradient(circle at 90% 85%, rgba(0,187,212,.14), transparent 30%),
          linear-gradient(180deg, #eff4fa 0%, #eef2f7 100%);
      }
      .topbar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px clamp(18px, 5vw, 72px);
        backdrop-filter: blur(12px);
        background: rgba(244,246,250,.76);
        border-bottom: 1px solid rgba(183,201,228,.6);
      }
      .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: .08em; }
      .brand img { width: 44px; height: 44px; border-radius: 12px; }
      .nav { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
      .nav a { color: var(--ink); text-decoration: none; font-weight: 600; font-size: 14px; }
      .nav a:hover { color: var(--blue); }
      .btn-web {
        border: 0;
        border-radius: 999px;
        padding: 12px 18px;
        color: #fff;
        background: linear-gradient(135deg, #007ff7 0%, #00b8e8 100%);
        font-weight: 700;
        text-decoration: none;
        box-shadow: 0 12px 30px rgba(0,111,222,.33);
      }
      .hero {
        min-height: 78vh;
        display: grid;
        align-content: center;
        justify-items: center;
        gap: 14px;
        text-align: center;
        padding: 52px 20px 24px;
      }
      .hero-logo { width: 138px; height: 138px; border-radius: 28px; box-shadow: 0 34px 90px rgba(10,53,117,.25); }
      h1 { margin: 0; font-size: clamp(38px, 6.8vw, 86px); line-height: .96; letter-spacing: -.04em; }
      .sub { max-width: 920px; margin: 0 auto; color: var(--ink-soft); font-size: clamp(16px, 2vw, 23px); line-height: 1.5; }
      .marquee { width: 100%; overflow: hidden; border-block: 1px solid var(--line); background: #ffffff8a; }
      .marquee-track {
        display: inline-flex;
        white-space: nowrap;
        padding: 16px 0;
        font-weight: 700;
        color: #004d9a;
        animation: run 23s linear infinite;
      }
      .marquee-track span { padding-inline: 18px; }
      @keyframes run { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      .grid {
        width: min(1160px, calc(100% - 28px));
        margin: 34px auto 56px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }
      .card {
        background: var(--card);
        border: 1px solid #d6e1f2;
        border-radius: 20px;
        padding: 22px;
        box-shadow: 0 10px 30px rgba(20, 42, 78, .08);
        transform: translateY(12px);
        opacity: 0;
        animation: rise .6s ease forwards;
      }
      .card:nth-child(2){ animation-delay: .08s; }
      .card:nth-child(3){ animation-delay: .16s; }
      .card h3 { margin: 0 0 10px; font-size: 20px; }
      .card p { margin: 0; color: #32435f; line-height: 1.55; }
      @keyframes rise { to { transform: translateY(0); opacity: 1; } }
      .split {
        width: min(1160px, calc(100% - 28px));
        margin: 0 auto 72px;
        display: grid;
        grid-template-columns: 1.1fr .9fr;
        gap: 16px;
      }
      .panel {
        border-radius: 24px;
        border: 1px solid #c7d7ee;
        background: linear-gradient(180deg, #fff, #edf4ff);
        padding: 26px;
      }
      .panel h2 { margin: 0 0 14px; font-size: 30px; letter-spacing: -.02em; }
      .panel ul { margin: 0; padding-left: 18px; color: #223756; line-height: 1.6; }
      .panel a { color: #005fc0; text-decoration: none; }
      .panel a:hover { text-decoration: underline; }
      .footer {
        background: #0b1220;
        color: #cbd8f0;
        padding: 52px clamp(20px, 5vw, 72px) 28px;
      }
      .footer-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 20px;
        margin-bottom: 26px;
      }
      .footer h4 { margin: 0 0 12px; color: #68a8ff; font-size: 14px; text-transform: uppercase; }
      .footer a { display: block; color: #e4eeff; text-decoration: none; margin: 7px 0; }
      .footer a:hover { color: #8fc1ff; }
      .telegram-link { display: inline-flex; align-items: center; gap: 8px; margin-top: 8px; }
      .big-brand {
        margin-top: 40px;
        font-size: clamp(58px, 16vw, 240px);
        font-weight: 800;
        line-height: .9;
        letter-spacing: -.04em;
        color: rgba(173, 199, 249, .24);
        user-select: none;
      }
      @media (max-width: 980px) {
        .grid { grid-template-columns: 1fr; }
        .split { grid-template-columns: 1fr; }
        .footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
    </style>
  </head>
  <body>
    <header class="topbar">
      <div class="brand"><img src="${logoDataUrl}" alt="TheGraphT" /><span>THEGRAPHT</span></div>
      <nav class="nav">
        <a href="/">Главная</a>
        <a href="/faq">FAQ</a>
        <a href="/privacy">Privacy</a>
        <a class="btn-web" href="https://web.thegrapht.su">Открыть Web версию</a>
      </nav>
    </header>

    <main>
      <section class="hero">
        <img src="${logoDataUrl}" alt="TheGraphT" class="hero-logo" />
        <h1>Безопасная связь<br />без лишнего шума</h1>
        <p class="sub">TheGraphT строится как прозрачная коммуникационная платформа: контроль сессий, управляемая инфраструктура сообщений, шифрование и защита каналов связи по слоям.</p>
      </section>

      <section class="marquee" aria-label="Ключевые принципы безопасности">
        <div class="marquee-track">
          <span>Шифрование сообщений</span><span>•</span><span>Контроль сессий</span><span>•</span><span>Логирование инцидентов</span><span>•</span><span>Защита от подмены origin</span><span>•</span><span>Прозрачные политики хранения</span><span>•</span><span>Шифрование сообщений</span><span>•</span><span>Контроль сессий</span><span>•</span><span>Логирование инцидентов</span><span>•</span><span>Защита от подмены origin</span><span>•</span><span>Прозрачные политики хранения</span>
        </div>
      </section>

      <section class="grid">
        <article class="card"><h3>Сессионная модель</h3><p>Авторизация идет через защищенные cookie, управляемые сервером. На сервере действует проверка сессии в БД и ротация активности по запросам.</p></article>
        <article class="card"><h3>Коммуникационные потоки</h3><p>Realtime и API работают как отдельные каналы с проверкой доступа, ограничениями payload и отказом для неподходящих origin.</p></article>
        <article class="card"><h3>Открытая документация</h3><p>Ключевые правила обработки данных и ограничений публикуются в FAQ и Privacy, без заявлений о несуществующих сертификациях.</p></article>
      </section>

      <section class="split">
        <article class="panel">
          <h2>Главный экран проекта</h2>
          <ul>
            <li>Переход к web-клиенту: <a href="https://web.thegrapht.su">web.thegrapht.su</a></li>
            <li>Большой технический FAQ: <a href="/faq">страница /faq</a></li>
            <li>Юридический блок и обработка данных: <a href="/privacy">страница /privacy</a></li>
            <li>Канал проекта: <a href="https://t.me/thegrapht">t.me/thegrapht</a></li>
          </ul>
        </article>
        <article class="panel">
          <h2>Фокус разработки</h2>
          <ul>
            <li>Стабилизация публичного web-домена и API маршрутизации.</li>
            <li>Усиление защиты хранения и передачи медиа.</li>
            <li>Управляемое развитие secure-диалогов и криптографических сценариев.</li>
            <li>Прозрачная правовая документация для России, ЕС и международных пользователей.</li>
          </ul>
        </article>
      </section>
    </main>

    <footer class="footer">
      <div class="footer-grid">
        <div><h4>Product</h4><a href="/">Overview</a><a href="/faq">FAQ</a><a href="https://web.thegrapht.su">Web Client</a></div>
        <div><h4>Security</h4><a href="/faq#security">Security model</a><a href="/faq#encryption">Encryption</a><a href="/privacy#security">Data safeguards</a></div>
        <div><h4>Policies</h4><a href="/privacy">Privacy Policy</a><a href="/privacy#legal-basis">Legal basis</a><a href="/privacy#cross-border">Cross-border transfer</a></div>
        <div><h4>Resources</h4><a href="/faq#api">API behavior</a><a href="/faq#media">Media handling</a><a href="/faq#roadmap">Roadmap</a></div>
        <div><h4>Community</h4><a href="https://t.me/thegrapht" class="telegram-link">✈ Telegram: @thegrapht</a></div>
      </div>
      <div>© 2026 TheGraphT. Информационные материалы проекта.</div>
      <div class="big-brand">THEGRAPHT</div>
    </footer>
  </body>
</html>`;
