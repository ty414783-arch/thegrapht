export const buildPrivacyHtml = ({
  inter400Url,
  inter500Url,
  inter600Url,
  inter700Url,
  inter800Url,
  logoDataUrl
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Privacy Policy — TheGraphT</title>
    <meta name="description" content="Privacy Policy and data protection terms for TheGraphT secure messaging platform." />
    <noscript>
      <style>
        .reveal-on-scroll {
          opacity: 1 !important;
          transform: none !important;
        }
      </style>
    </noscript>
    <style>
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 400; src: url("${inter400Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 500; src: url("${inter500Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 600; src: url("${inter600Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 700; src: url("${inter700Url}") format("truetype"); }
      @font-face { font-family: "Inter"; font-style: normal; font-weight: 800; src: url("${inter800Url}") format("truetype"); }

      :root {
        --bg: #0a0e17;
        --bg-card: #121826;
        --text: #f8fafc;
        --text-soft: #94a3b8;
        --line: rgba(255, 255, 255, 0.08);
        --discord: #5865F2;
        --discord-hover: #4752C4;
        --telegram: #0088cc;
        --telegram-hover: #0077b3;
        --shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2);
        --topbar-h: 80px;
        --font-discord: "gg sans", "Uni Sans", "Montserrat", "Inter", sans-serif;
      }

      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; font-family: "Inter", sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
      body {
        position: relative;
        overflow-x: hidden;
        /* Global Dot Matrix Blueprint Background */
        background-color: var(--bg);
        background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1.2px, transparent 1.2px);
        background-size: 24px 24px;
      }

      /* Background Glow */
      .bg-glow-1 {
        position: absolute;
        top: -10%;
        left: -10%;
        width: 50%;
        height: 50%;
        background: radial-gradient(circle, rgba(88, 101, 242, 0.12) 0%, transparent 70%);
        z-index: -1;
        pointer-events: none;
        filter: blur(80px);
      }
      .bg-glow-2 {
        position: absolute;
        top: 40%;
        right: -10%;
        width: 50%;
        height: 50%;
        background: radial-gradient(circle, rgba(0, 242, 254, 0.1) 0%, transparent 70%);
        z-index: -1;
        pointer-events: none;
        filter: blur(80px);
      }

      .topbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: var(--topbar-h);
        z-index: 100;
        border-bottom: 1px solid var(--line);
        background: rgba(10, 14, 23, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      .topbar-inner {
        width: min(1200px, calc(100% - 32px));
        margin: 0 auto;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: var(--font-discord);
        font-weight: 900;
        font-size: 22px;
        letter-spacing: -0.02em;
        color: var(--text);
        text-decoration: none;
      }
      .brand img {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(88, 101, 242, 0.15);
      }

      .menu { display: flex; align-items: center; gap: 28px; }
      .menu a { text-decoration: none; color: var(--text-soft); font-size: 15px; font-weight: 500; transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
      .menu a:hover { color: var(--discord); }
      
      .menu .web-btn {
        color: #fff !important;
        padding: 10px 22px;
        border-radius: 40px;
        background: var(--discord);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
        box-shadow: 0 4px 14px rgba(88, 101, 242, 0.25);
      }
      .menu .web-btn:hover {
        background: var(--discord-hover);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(88, 101, 242, 0.35);
      }

      main { padding-top: calc(var(--topbar-h) + 40px); }

      .wrap {
        width: min(1000px, calc(100% - 32px));
        margin: 0 auto 64px;
      }

      /* Staggered Scroll-driven reveal animations */
      .reveal-on-scroll {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .reveal-on-scroll.revealed {
        opacity: 1;
        transform: translateY(0);
      }

      .hero, .article {
        position: relative;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: var(--bg-card);
        box-shadow: var(--shadow);
        overflow: hidden;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
      }

      .hero {
        padding: clamp(32px, 5vw, 56px);
        margin-bottom: 32px;
      }

      .article {
        padding: clamp(32px, 6vw, 56px);
      }

      /* spotlight radial gradient mask */
      .hero::before, .article::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        background: radial-gradient(400px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(0, 242, 254, 0.12), transparent 80%);
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: 0;
      }
      .hero:hover::before, .article:hover::before {
        opacity: 1;
      }

      .hero *, .article * {
        position: relative;
        z-index: 1;
      }

      .hero:hover, .article:hover {
        border-color: rgba(0, 242, 254, 0.25);
        box-shadow: 0 15px 35px rgba(0, 242, 254, 0.04), 0 1px 3px rgba(0, 242, 254, 0.02);
      }
      
      .hero h1 {
        margin: 0 0 12px;
        font-family: var(--font-discord);
        font-size: clamp(32px, 5vw, 54px);
        letter-spacing: -0.02em;
        font-weight: 900;
      }
      .hero p {
        margin: 0;
        color: var(--text-soft);
        line-height: 1.6;
        font-size: clamp(15px, 1.8vw, 17px);
      }
      
      .article h2 {
        margin: 0 0 24px;
        font-family: var(--font-discord);
        font-size: 28px;
        font-weight: 900;
        letter-spacing: -0.02em;
        color: var(--text);
        border-bottom: 2px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 12px;
      }
      
      .article h3 {
        margin: 36px 0 12px;
        font-family: var(--font-discord);
        font-size: 19px;
        font-weight: 800;
        color: var(--text);
        scroll-margin-top: calc(var(--topbar-h) + 24px);
      }
      
      .article p, .article li {
        color: var(--text-soft);
        line-height: 1.75;
        font-size: 15.5px;
      }
      
      .article ul {
        margin: 12px 0 0;
        padding-left: 20px;
      }
      
      .article li {
        margin-bottom: 8px;
      }

      /* Footer */
      .footer {
        background: #090d16;
        color: #94a3b8;
        padding: clamp(48px, 8vw, 80px) 0 32px;
        position: relative;
        overflow: hidden;
      }
      .footer-inner {
        width: min(1200px, calc(100% - 32px));
        margin: 0 auto;
        position: relative;
        z-index: 2;
      }
      
      .footer-top {
        display: grid;
        grid-template-columns: 1.5fr repeat(3, 1fr);
        gap: 40px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 48px;
        margin-bottom: 32px;
      }

      .footer-brand {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .footer-brand .brand {
        color: #ffffff;
      }

      .footer-col h4 {
        margin: 0 0 16px;
        color: #f1f5f9;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 700;
      }
      .footer-col a {
        display: block;
        text-decoration: none;
        color: #94a3b8;
        margin: 10px 0;
        font-size: 14px;
        transition: color 0.2s ease;
      }
      .footer-col a:hover {
        color: #ffffff;
      }

      .footer-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        font-size: 13px;
        color: #64748b;
      }

      .footer-logo-big {
        width: 100%;
        margin-top: 48px;
        font-family: var(--font-discord);
        font-size: clamp(60px, 14vw, 175px);
        font-weight: 900;
        line-height: 0.85;
        letter-spacing: -0.05em;
        text-align: center;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        user-select: none;
        pointer-events: none;
      }

      @media (max-width: 900px) {
        .footer-top { grid-template-columns: 1fr; gap: 24px; }
      }
      @media (max-width: 768px) {
        :root { --topbar-h: 72px; }
        .menu { display: none; }
        .footer-brand { margin-bottom: 16px; }
      }
    </style>
  </head>
  <body>
    <div class="bg-glow-1"></div>

    <header class="topbar">
      <div class="topbar-inner">
        <a href="/" class="brand">
          <img src="${logoDataUrl}" alt="TheGraphT" />
          <span>THEGRAPHT</span>
        </a>
        <nav class="menu">
          <a href="/">Home</a>
          <a href="/product">Roadmap</a>
          <a href="/security">Security</a>
          <a href="/technologies">Specs</a>
          <a href="https://web.thegrapht.su" class="web-btn">Open Web Client</a>
        </nav>
      </div>
    </header>

    <main class="wrap">
      <section class="hero reveal-on-scroll">
        <h1>Privacy Policy</h1>
        <p><strong>Last Updated: April 30, 2026</strong>. This document specifies TheGraphT's operational framework for data protection, user authorization safeguards, and compliance structures across applicable jurisdictions.</p>
      </section>

      <article class="article reveal-on-scroll">
        <h2>Data Processing Framework</h2>

        <h3 id="legal-basis">1. Legal Basis for Processing</h3>
        <p>We process information strictly under clear legal justifications, including:</p>
        <ul>
          <li><strong>Performance of User Terms</strong>: Delivering core instant messaging capabilities, real-time message sync, and group structures.</li>
          <li><strong>Regulatory Standards Compliance</strong>: Fulfilling mandated logging and reporting directives where legally enforceable.</li>
          <li><strong>System Integrity and Safety</strong>: Protecting infrastructure, investigating security incidents, and neutralizing brute-force attempts.</li>
          <li><strong>Consent Actions</strong>: Where explicit user consent has been granted for localized processing actions.</li>
        </ul>

        <h3 id="data-categories">2. Processed Information Categories</h3>
        <p>To preserve technical isolation and support essential platform services, we collect:</p>
        <ul>
          <li><strong>Account Parameters</strong>: Email address, username, profile descriptors, and custom avatar assets.</li>
          <li><strong>Session Identifiers</strong>: HTTP cookies containing isolated session tokens, system parameters, and network descriptors.</li>
          <li><strong>Interactive Payload Content</strong>: Text dispatches, media attachments, and metadata necessary to route channels cleanly.</li>
          <li><strong>Defensive Logging Records</strong>: Network logs containing access parameters and telemetry metadata restricted to debugging.</li>
        </ul>

        <h3 id="security-measures">3. Hardened Security Safeguards</h3>
        <p>TheGraphT deploys industry-grade organizational and architectural protections, detailed in our specifications:</p>
        <ul>
          <li><strong>Cookie Sandbox Isolation</strong>: Storing credentials exclusively in <code>HttpOnly</code>, <code>Secure</code>, and <code>SameSite</code> cookies to prevent browser-level access.</li>
          <li><strong>Role-Based Interface Gates</strong>: Constraining resource views to authenticated identities belonging strictly to specific conversations.</li>
          <li><strong>Origin Verification Barriers</strong>: Hard-validating client headers to fully eliminate CSRF attack vectors.</li>
          <li><strong>Cryptographic Salting</strong>: Encoding credential records with high-cost <code>scrypt</code> configurations.</li>
        </ul>

        <h3 id="cross-border">4. Cross-Border Operations</h3>
        <p>Because the platform utilizes distributed global networks to scale latency constraints, data routing paths may cross national boundaries. We establish standardized technical mechanisms and strict configuration isolation to guarantee an equivalent protection tier regardless of destination.</p>

        <h3 id="retention">5. Storage Retention Limits</h3>
        <p>Information is kept strictly for the duration required to achieve specific functional goals, secure platform boundaries, or comply with legal requirements. Upon deletion triggers or account termination requests, raw data is immediately dropped or anonymized.</p>

        <h3 id="rights">6. Your User Rights</h3>
        <p>Under applicable international privacy frameworks, users maintain standard controls:</p>
        <ul>
          <li><strong>Composition Inquiry</strong>: Querying processing registers to understand what data exists.</li>
          <li><strong>Rectification & Erasure</strong>: Requesting updates to broken metadata or immediate deletion of account records.</li>
          <li><strong>Portability Request</strong>: Requesting standard files export of user-generated content history.</li>
        </ul>

        <h3 id="age-limit">7. Age Limits & Consent</h3>
        <p>The service restricts access to individuals below the digital consent age in their respective regions. If automated monitoring or manual report paths flag profile profiles belonging to minor age groups, the records are purged from persistence layers.</p>

        <h3 id="regulatory">8. Regulatory Requests & Disclosures</h3>
        <p>TheGraphT evaluates regulatory requests strictly against local legal boundaries. We reject generalized information searches or non-binding requests, challenging overreaching legal scripts through formal judicial procedures.</p>

        <h3 id="contacts">9. Official Contacts</h3>
        <p>For questions concerning data storage configurations, retention paths, or user rights execution, utilize our central channel: <a href="https://t.me/thegrapht">https://t.me/thegrapht</a>.</p>

        <h3 id="updates">10. Policy Modifications</h3>
        <p>We update this policy periodically to match adjustments in server schemas, microservice isolation, or legal rules. Revised editions are posted here with clear timestamp logs.</p>
      </article>
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="footer-brand">
            <a href="/" class="brand">
              <img src="${logoDataUrl}" alt="TheGraphT" />
              <span>THEGRAPHT</span>
            </a>
          </div>
          <div class="footer-col">
            <h4>Platform</h4>
            <a href="/">Home Page</a>
            <a href="/product">Roadmap & Specs</a>
            <a href="https://web.thegrapht.su">Web Client</a>
          </div>
          <div class="footer-col">
            <h4>Policy</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="#legal-basis">Legal Basis</a>
            <a href="#security-measures">Data Safety</a>
          </div>
          <div class="footer-col">
            <h4>Community</h4>
            <a href="https://t.me/thegrapht" style="display:flex; align-items:center;">
              <svg class="tg-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="display:inline-block; vertical-align:middle; margin-right:6px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-1.07 5.48-1.53 7.82-.2.95-.55 1.27-.88 1.3-.73.07-1.28-.47-1.99-.94-1.11-.74-1.74-1.2-2.82-1.91-1.25-.82-.44-1.27.27-2.01.19-.19 3.42-3.13 3.48-3.4.01-.03.01-.15-.06-.21-.07-.06-.18-.04-.26-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.34-.26-1.99-.48-.8-.26-1.44-.4-1.38-.85.03-.23.35-.47.96-.71 3.76-1.64 6.27-2.72 7.52-3.25 3.58-1.51 4.32-1.77 4.81-1.78.11 0 .35.03.5.16.13.12.17.29.19.41.01.07.03.24.01.31z"/></svg>
              Telegram Channel
            </a>
          </div>
        </div>
        
        <div class="footer-bottom">
          <span>© 2026 TheGraphT. Technical documentation and assets. Target Release: 29.05.2026</span>
        </div>
        
        <div class="footer-logo-big">THEGRAPHT</div>
      </div>
    </footer>

    <script>
      document.addEventListener('DOMContentLoaded', () => {
        // --- 1. Spotlight Mouse Glow Cards Logic ---
        const handleMouseMove = (e, element) => {
          const rect = element.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          element.style.setProperty('--mouse-x', \`\${x}px\`);
          element.style.setProperty('--mouse-y', \`\${y}px\`);
        };

        document.querySelectorAll('.article, .hero').forEach(card => {
          card.addEventListener('mousemove', (e) => handleMouseMove(e, card));
        });

        // --- 2. Scroll-Driven Reveal Animations ---
        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              // unobserve once revealed to save CPU loops
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal-on-scroll').forEach(element => {
          revealObserver.observe(element);
        });
      });
    </script>
  </body>
</html>`;
