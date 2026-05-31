export const buildFaqHtml = ({
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
    <title>FAQ - TheGraphT</title>
    <meta name="description" content="Подробный FAQ TheGraphT: продукт, безопасность, API, медиа, инфраструктура, модерация и правовые разделы." />
    <style>
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 400; src: url("${inter400Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 500; src: url("${inter500Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 600; src: url("${inter600Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 700; src: url("${inter700Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 800; src: url("${inter800Url}") format("truetype"); }

      :root {
        --bg: #f3f6fc;
        --text: #111f39;
        --text-soft: #3e5578;
        --line: #d0def1;
        --panel: #ffffffdc;
        --blue: #0b73df;
        --topbar-h: 76px;
      }

      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; font-family: "Inter", sans-serif; background: var(--bg); color: var(--text); scroll-behavior: smooth; }
      body {
        background:
          radial-gradient(circle at 10% 8%, rgba(11,115,223,.08), transparent 24%),
          radial-gradient(circle at 85% 88%, rgba(38,157,235,.1), transparent 28%),
          linear-gradient(180deg, #edf4fc 0%, #f3f7fd 100%);
      }

      .topbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: var(--topbar-h);
        border-bottom: 1px solid var(--line);
        background: rgba(243, 246, 252, 0.9);
        backdrop-filter: blur(10px);
        z-index: 100;
      }
      .topbar-inner {
        width: min(1320px, calc(100% - 24px));
        margin: 0 auto;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: .08em; white-space: nowrap; }
      .brand img { width: 40px; height: 40px; border-radius: 10px; }
      .menu { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: flex-end; }
      .menu a { text-decoration: none; color: var(--text); font-size: 14px; font-weight: 600; }
      .menu a:hover { color: var(--blue); }
      .menu .web-btn { color: #fff; padding: 10px 16px; border-radius: 999px; background: linear-gradient(135deg, #0b73df, #1b9be8); box-shadow: 0 10px 22px rgba(11, 115, 223, .26); }

      main { padding-top: calc(var(--topbar-h) + 18px); }

      .hero {
        width: min(1320px, calc(100% - 24px));
        margin: 0 auto 12px;
        border: 1px solid var(--line);
        border-radius: 24px;
        padding: clamp(22px, 4vw, 42px);
        background: linear-gradient(130deg, #ffffffdd 0%, #ebf3ffdb 100%);
      }
      .hero h1 { margin: 0 0 8px; font-size: clamp(30px, 4.8vw, 58px); line-height: .98; letter-spacing: -.02em; }
      .hero p { margin: 0; color: var(--text-soft); line-height: 1.62; max-width: 980px; font-size: clamp(15px, 1.8vw, 20px); }

      .layout {
        width: min(1320px, calc(100% - 24px));
        margin: 0 auto 24px;
        display: grid;
        grid-template-columns: 290px minmax(0, 1fr);
        gap: 14px;
      }

      .sidebar {
        position: sticky;
        top: calc(var(--topbar-h) + 10px);
        align-self: start;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: #ffffffcc;
        padding: 14px;
        max-height: calc(100vh - var(--topbar-h) - 24px);
        overflow: auto;
      }
      .sidebar h3 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #4f6691; letter-spacing: .08em; }
      .sidebar a { display: block; text-decoration: none; color: #1b3968; padding: 7px 0; font-weight: 600; font-size: 14px; }
      .sidebar a:hover { color: var(--blue); }

      .articles { display: grid; gap: 12px; }
      .article {
        scroll-margin-top: calc(var(--topbar-h) + 12px);
        border: 1px solid var(--line);
        border-radius: 18px;
        background: var(--panel);
        padding: 18px;
        box-shadow: 0 8px 22px rgba(20, 49, 95, .07);
      }
      .article h2 { margin: 0 0 8px; font-size: clamp(24px, 3vw, 34px); letter-spacing: -.02em; }
      .article h3 { margin: 12px 0 6px; font-size: 19px; }
      .article p, .article li { color: #31496f; line-height: 1.65; }
      .article ul { margin: 8px 0 0; padding-left: 18px; }

      .footer {
        background: #0b1321;
        color: #d6e3fb;
        padding: 44px 0 24px;
      }
      .footer-inner { width: min(1320px, calc(100% - 24px)); margin: 0 auto; }
      .footer-cols { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; }
      .footer h4 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #74adff; }
      .footer a { display: block; color: #eef4ff; text-decoration: none; margin: 6px 0; }
      .footer a:hover { color: #9ec5ff; }
      .big-brand { margin-top: 24px; font-size: clamp(56px, 14vw, 220px); line-height: .9; font-weight: 800; color: rgba(167, 193, 245, .21); user-select: none; }

      @media (max-width: 1080px) {
        :root { --topbar-h: 72px; }
        .layout { grid-template-columns: 1fr; }
        .sidebar { position: static; max-height: none; }
        .footer-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      }

      @media (max-width: 760px) {
        :root { --topbar-h: 70px; }
        .menu { gap: 9px; }
        .menu a { font-size: 13px; }
        .footer-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
    </style>
  </head>
  <body>
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand"><img src="${logoDataUrl}" alt="TheGraphT" /><span>THEGRAPHT</span></div>
        <nav class="menu">
          <a href="/">Главная</a>
          <a href="/faq">FAQ</a>
          <a href="/privacy">Privacy</a>
          <a href="https://web.thegrapht.su" class="web-btn">Открыть Web версию</a>
        </nav>
      </div>
    </header>

    <main>
      <section class="hero">
        <h1>FAQ TheGraphT</h1>
        <p>Подробная справочная страница о текущем состоянии платформы: отдельные статьи по продукту, безопасности, шифрованию, API, медиа, инфраструктуре, модерации и правовым аспектам. Тексты соответствуют фактическому статусу проекта без ложных обещаний.</p>
      </section>

      <div class="layout">
        <aside class="sidebar">
          <h3>Статьи и разделы</h3>
          <a href="#product">1. Продукт и статус</a>
          <a href="#security">2. Модель безопасности</a>
          <a href="#encryption">3. Шифрование и secure-диалоги</a>
          <a href="#sessions">4. Сессии и авторизация</a>
          <a href="#api">5. API и realtime</a>
          <a href="#media">6. Медиа и вложения</a>
          <a href="#infra">7. Инфраструктура и домены</a>
          <a href="#moderation">8. Анти-абьюз и модерация</a>
          <a href="#privacy">9. Данные и privacy</a>
          <a href="#roadmap">10. Roadmap</a>
          <a href="#support">11. Поддержка и каналы</a>
        </aside>

        <section class="articles">
          <article class="article" id="product">
            <h2>1. Продукт и статус</h2>
            <h3>Что сейчас реализовано</h3>
            <ul>
              <li>Регистрация и вход пользователя.</li>
              <li>Список диалогов и отправка сообщений.</li>
              <li>Realtime-обновления для активных сессий.</li>
              <li>Передача изображений и выдача медиа по доступу.</li>
            </ul>
            <h3>Что важно понимать</h3>
            <p>Проект находится в стадии активного развития. Функции дорабатываются и стабилизируются; часть сценариев может изменяться по мере выхода новых итераций.</p>
          </article>

          <article class="article" id="security">
            <h2>2. Модель безопасности</h2>
            <h3>Базовые принципы</h3>
            <ul>
              <li>Серверная валидация входящих запросов.</li>
              <li>Проверка origin для mutating-операций в браузере.</li>
              <li>Контроль запросов по лимитам и защита от перегрузки.</li>
              <li>Изоляция сервисов в контейнерной архитектуре.</li>
            </ul>
            <h3>Практический результат</h3>
            <p>Снижается риск несанкционированных действий из сторонних origin и риск злоупотреблений через массовые автоматические запросы.</p>
          </article>

          <article class="article" id="encryption">
            <h2>3. Шифрование и secure-диалоги</h2>
            <p>В платформе развивается направление secure-общения с отдельной логикой ключевых данных. Криптографические детали и протокольные версии публикуются по мере стабилизации реализации.</p>
            <ul>
              <li>Сценарии secure-диалогов выделены отдельно от базовых чатов.</li>
              <li>Система хранит данные, необходимые для проверяемого обмена сообщениями.</li>
              <li>Ограничения текущей версии указаны явно и не маскируются маркетинговыми формулировками.</li>
            </ul>
          </article>

          <article class="article" id="sessions">
            <h2>4. Сессии и авторизация</h2>
            <ul>
              <li>Сессионный доступ реализован через серверно-проверяемые cookie.</li>
              <li>Токены не выдаются в открытом JSON после входа.</li>
              <li>При недействительной сессии доступ блокируется, клиент получает статус unauthorized.</li>
            </ul>
          </article>

          <article class="article" id="api">
            <h2>5. API и realtime</h2>
            <h3>HTTP API</h3>
            <p>Используется для регистрации, входа, операций с диалогами, отправки/чтения сообщений, загрузки медиа и вспомогательных сценариев клиента.</p>
            <h3>Realtime</h3>
            <p>WebSocket-слой передает изменения в диалогах, typing/presence-события и другие операционные уведомления в рамках прав пользователя.</p>
          </article>

          <article class="article" id="media">
            <h2>6. Медиа и вложения</h2>
            <ul>
              <li>Допускаются ограниченные типы изображений.</li>
              <li>Файл проверяется по MIME и сигнатуре содержимого (magic bytes).</li>
              <li>Пути хранения контролируются для защиты от traversal-атак.</li>
              <li>Выдача медиа доступна только авторизованному участнику диалога.</li>
            </ul>
          </article>

          <article class="article" id="infra">
            <h2>7. Инфраструктура и домены</h2>
            <ul>
              <li><strong>thegrapht.su</strong> — информационные страницы проекта.</li>
              <li><strong>web.thegrapht.su</strong> — основной web-клиент мессенджера.</li>
              <li>Docker-слой разделяет frontend/backend/mtproto/postgres/turn.</li>
              <li>Критичные сервисы публикуются только там, где это нужно для продукта.</li>
            </ul>
          </article>

          <article class="article" id="moderation">
            <h2>8. Анти-абьюз и модерация</h2>
            <p>Платформа применяет технические меры против злоупотреблений: лимитирование, ограничение подозрительных запросов, операционные проверки аномалий и внутренние процедуры инцидент-реагирования.</p>
          </article>

          <article class="article" id="privacy">
            <h2>9. Данные и privacy</h2>
            <p>Юридические условия обработки и права пользователей собраны на отдельной странице <a href="/privacy">/privacy</a>. Документ учитывает применимые нормы РФ, ЕС и международные практики.</p>
            <ul>
              <li>Категории данных и цели обработки.</li>
              <li>Правовые основания и сроки хранения.</li>
              <li>Права субъектов данных и каналы обращений.</li>
            </ul>
          </article>

          <article class="article" id="roadmap">
            <h2>10. Roadmap</h2>
            <ul>
              <li>Повышение стабильности публичного web-клиента.</li>
              <li>Расширение возможностей secure-коммуникации.</li>
              <li>Усиление наблюдаемости и диагностических инструментов.</li>
              <li>Расширение пользовательских и административных сценариев.</li>
            </ul>
          </article>

          <article class="article" id="support">
            <h2>11. Поддержка и каналы</h2>
            <ul>
              <li>Web-клиент: <a href="https://web.thegrapht.su">web.thegrapht.su</a></li>
              <li>Главная документация: <a href="/">thegrapht.su</a></li>
              <li>Privacy: <a href="/privacy">/privacy</a></li>
              <li>Telegram проекта: <a href="https://t.me/thegrapht">https://t.me/thegrapht</a></li>
            </ul>
          </article>
        </section>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-cols">
          <div><h4>Product</h4><a href="/">Overview</a><a href="/faq">FAQ</a><a href="https://web.thegrapht.su">Web Client</a></div>
          <div><h4>Security</h4><a href="#security">Security Model</a><a href="#sessions">Sessions</a><a href="#media">Media</a></div>
          <div><h4>Policy</h4><a href="/privacy">Privacy</a><a href="/privacy#legal-basis">Legal Basis</a><a href="/privacy#rights">User Rights</a></div>
          <div><h4>Tech</h4><a href="#api">API</a><a href="#infra">Infrastructure</a><a href="#roadmap">Roadmap</a></div>
          <div><h4>Community</h4><a href="https://t.me/thegrapht">✈ Telegram: @thegrapht</a></div>
        </div>
        <div class="big-brand">THEGRAPHT</div>
      </div>
    </footer>
  </body>
</html>`;
