export const buildPrivacyHtml = ({
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
    <title>Privacy Policy - TheGraphT</title>
    <meta name="description" content="Политика конфиденциальности TheGraphT: Россия, ЕС и международные требования к обработке данных." />
    <style>
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 400; src: url("${inter400Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 500; src: url("${inter500Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 600; src: url("${inter600Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 700; src: url("${inter700Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 800; src: url("${inter800Url}") format("truetype"); }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: "Inter", sans-serif; background: #f4f6fb; color: #0f1a2d; }
      .topbar { position: sticky; top: 0; z-index: 20; display: flex; justify-content: space-between; align-items: center; padding: 14px clamp(16px, 4vw, 52px); background: #f4f6fbdd; backdrop-filter: blur(10px); border-bottom: 1px solid #d8e2f2; }
      .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; letter-spacing: .08em; }
      .brand img { width: 36px; height: 36px; border-radius: 10px; }
      .nav { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
      .nav a { text-decoration: none; color: #1e3256; font-weight: 600; font-size: 14px; }
      .nav .btn { color: #fff; padding: 10px 14px; border-radius: 999px; background: linear-gradient(135deg, #0076e8, #0da6e4); }
      .wrap { width: min(1080px, calc(100% - 24px)); margin: 18px auto 32px; }
      .hero { background: #fff; border: 1px solid #d4e0f2; border-radius: 18px; padding: 24px; }
      h1 { margin: 0 0 8px; font-size: clamp(30px, 4vw, 52px); letter-spacing: -.03em; }
      .meta { color: #476084; line-height: 1.55; }
      .article { margin-top: 10px; background: #fff; border: 1px solid #d4e0f2; border-radius: 18px; padding: 24px; }
      h2 { margin: 0 0 10px; font-size: 30px; letter-spacing: -.02em; }
      h3 { margin: 16px 0 8px; font-size: 20px; }
      p, li { color: #2c415f; line-height: 1.64; }
      ul { margin: 8px 0; padding-left: 18px; }
      .footer { margin-top: 18px; background: #0a111d; color: #d6e1f5; padding: 42px clamp(16px, 4vw, 52px) 26px; }
      .cols { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
      .footer h4 { margin: 0 0 8px; color: #6ca9ff; font-size: 13px; text-transform: uppercase; }
      .footer a { color: #edf3ff; text-decoration: none; display: block; margin: 6px 0; }
      .footer a:hover { color: #9cc4ff; }
      .big { margin-top: 24px; font-size: clamp(56px, 15vw, 220px); line-height: .9; font-weight: 800; color: rgba(174,198,245,.2); user-select: none; }
      @media (max-width: 900px) { .cols { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    </style>
  </head>
  <body>
    <header class="topbar">
      <div class="brand"><img src="${logoDataUrl}" alt="TheGraphT" /><span>THEGRAPHT</span></div>
      <nav class="nav">
        <a href="/">Главная</a>
        <a href="/faq">FAQ</a>
        <a href="/privacy">Privacy</a>
        <a href="https://web.thegrapht.su" class="btn">Открыть Web версию</a>
      </nav>
    </header>

    <main class="wrap">
      <section class="hero">
        <h1>Privacy Policy</h1>
        <p class="meta">Дата обновления: 30 апреля 2026. Этот документ определяет подход TheGraphT к обработке и защите данных пользователей с учетом применимых требований права РФ, ЕС и иных юрисдикций, где сервис доступен.</p>
      </section>

      <article class="article">
        <h2>Политика обработки данных</h2>
        <h3 id="legal-basis">1. Правовые основания обработки</h3>
        <ul>
          <li>Исполнение пользовательского соглашения и предоставление функциональности сервиса.</li>
          <li>Соблюдение применимых требований законодательства (включая требования отчетности и реагирования на законные запросы).</li>
          <li>Законные интересы оператора: безопасность сервиса, предотвращение злоупотреблений, расследование инцидентов.</li>
          <li>Согласие субъекта данных в случаях, когда оно требуется законом.</li>
        </ul>

        <h3>2. Категории обрабатываемых данных</h3>
        <ul>
          <li>Идентификаторы учетной записи (email, имя профиля, технические идентификаторы).</li>
          <li>Сессионные и технические данные доступа (cookie-сессия, сетевые метаданные, client events).</li>
          <li>Контент, переданный пользователем в рамках функциональности сервиса (сообщения и вложения в соответствии с настройками).</li>
          <li>Служебные логи и данные безопасности для обеспечения работоспособности и защиты платформы.</li>
        </ul>

        <h3 id="security">3. Меры защиты данных</h3>
        <ul>
          <li>Ограничение доступа по ролям и техническим контурам.</li>
          <li>Сегментация сервисов и инфраструктурные сетевые ограничения.</li>
          <li>Контроль происхождения запросов и валидация входных данных.</li>
          <li>Мониторинг аномалий, ограничение частоты запросов и протоколирование инцидентов.</li>
        </ul>

        <h3 id="cross-border">4. Трансграничная передача</h3>
        <p>При использовании международной инфраструктуры передача данных может осуществляться между юрисдикциями. В таких случаях оператор применяет договорные, организационные и технические меры для обеспечения сопоставимого уровня защиты данных в принимающей юрисдикции.</p>

        <h3>5. Сроки хранения</h3>
        <p>Данные хранятся в объеме и в течение сроков, необходимых для исполнения целей обработки, обеспечения безопасности, выполнения законных обязательств и урегулирования споров. После достижения целей хранения данные удаляются или обезличиваются по применимой политике retention.</p>

        <h3 id="rights">6. Права пользователя</h3>
        <ul>
          <li>Запрос сведений о факте и составе обработки персональных данных.</li>
          <li>Требование об уточнении, блокировании или удалении данных при наличии оснований.</li>
          <li>Возражение против отдельных видов обработки, если это предусмотрено применимым правом.</li>
          <li>Запрос копии данных и переносимость там, где это допускается законодательством.</li>
        </ul>

        <h3>7. Дети и ограничение возраста</h3>
        <p>Сервис не предназначен для сознательного сбора данных у лиц, не достигших минимального возраста использования цифровых сервисов, установленного применимым правом. При выявлении таких случаев данные подлежат удалению в разумный срок.</p>

        <h3>8. Государственные и правоприменительные запросы</h3>
        <p>TheGraphT рассматривает только надлежаще оформленные юридически обязательные запросы и действует в пределах применимого законодательства. Запросы, выходящие за рамки правовых оснований, оспариваются в установленном порядке.</p>

        <h3 id="contacts">9. Контакты по вопросам данных</h3>
        <p>По вопросам реализации прав субъекта данных и обработки персональных данных используйте официальный канал проекта: <a href="https://t.me/thegrapht">https://t.me/thegrapht</a>. Для ускорения обработки обращения указывайте идентификатор учетной записи и предмет запроса.</p>

        <h3>10. Изменения политики</h3>
        <p>Политика может обновляться по мере изменения архитектуры сервиса, бизнес-процессов и правовых требований. Актуальная редакция публикуется на этой странице с указанием даты обновления.</p>
      </article>
    </main>

    <footer class="footer">
      <div class="cols">
        <div><h4>Platform</h4><a href="/">Главная</a><a href="/faq">FAQ</a><a href="https://web.thegrapht.su">Web Client</a></div>
        <div><h4>Policy</h4><a href="/privacy">Privacy Policy</a><a href="#legal-basis">Legal Basis</a><a href="#cross-border">Cross-border</a></div>
        <div><h4>Rights</h4><a href="#rights">User Rights</a><a href="#contacts">Contacts</a></div>
        <div><h4>Community</h4><a href="https://t.me/thegrapht">✈ Telegram @thegrapht</a></div>
      </div>
      <div class="big">THEGRAPHT</div>
    </footer>
  </body>
</html>`;
