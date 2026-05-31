export const buildHomeHtml = ({
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
    <title>TheGraphT — Secure Communication Platform</title>
    <meta name="description" content="TheGraphT: a highly resilient, modern messenger featuring open client architecture, WebSocket realtime sync, PostgreSQL group persistence, and cookie session isolation." />
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
      html, body { margin: 0; padding: 0; font-family: "Inter", sans-serif; background: var(--bg); color: var(--text); scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
      
      body {
        position: relative;
        overflow-x: hidden;
        /* Global Dot Matrix Blueprint Background */
        background-color: var(--bg);
        background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1.2px, transparent 1.2px);
        background-size: 24px 24px;
      }

      /* Background Glows */
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
        transition: all 0.3s ease;
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

      main { padding-top: calc(var(--topbar-h) + 20px); }

      .hero {
        width: min(1200px, calc(100% - 32px));
        margin: 0 auto clamp(40px, 8vw, 80px);
        text-align: center;
        padding: clamp(24px, 5vw, 48px) 16px;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      /* Dynamic Canvas Canvas Wrapper */
      .canvas-container {
        position: relative;
        width: 100%;
        max-width: 850px;
        height: 180px;
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 20px;
        overflow: hidden;
      }
      #hero-particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: auto;
      }

      .hero h1 {
        margin: 0 auto 20px;
        font-family: var(--font-discord);
        font-size: clamp(34px, 5.5vw, 64px);
        line-height: 1.05;
        letter-spacing: -0.03em;
        font-weight: 900;
        color: var(--text);
        max-width: 900px;
      }
      
      .hero h1 span {
        background: linear-gradient(135deg, #00f2fe, #7f00ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .hero p {
        margin: 0 auto 36px;
        color: var(--text-soft);
        line-height: 1.6;
        font-size: clamp(15px, 1.8vw, 19px);
        max-width: 720px;
        font-weight: 400;
      }

      .cta-buttons {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
        align-items: center;
      }
      
      .cta-btn-primary {
        text-decoration: none;
        color: #fff;
        padding: 16px 36px;
        border-radius: 40px;
        background: var(--discord);
        font-weight: 600;
        font-size: 16px;
        box-shadow: 0 8px 24px rgba(88, 101, 242, 0.25);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .cta-btn-primary:hover {
        background: var(--discord-hover);
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(88, 101, 242, 0.35);
      }
      
      .cta-btn-secondary {
        text-decoration: none;
        color: var(--text);
        padding: 16px 36px;
        border-radius: 40px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--line);
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: var(--shadow);
      }
      .cta-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
        transform: translateY(-2px);
      }

      .section {
        width: min(1200px, calc(100% - 32px));
        margin: 0 auto clamp(60px, 10vw, 100px);
      }

      .section-title {
        margin: 0 auto 12px;
        font-family: var(--font-discord);
        font-size: clamp(28px, 4vw, 44px);
        letter-spacing: -0.02em;
        font-weight: 900;
        text-align: center;
      }
      
      .section-desc {
        text-align: center;
        color: var(--text-soft);
        max-width: 600px;
        margin: 0 auto 48px;
        font-size: clamp(15px, 1.8vw, 17px);
        line-height: 1.6;
      }

      /* Staggered Scroll-driven reveal animations classes */
      .reveal-on-scroll {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .reveal-on-scroll.revealed {
        opacity: 1;
        transform: translateY(0);
      }
      .stagger-1 { transition-delay: 0.05s; }
      .stagger-2 { transition-delay: 0.15s; }
      .stagger-3 { transition-delay: 0.25s; }

      /* Sleek spotlight Glowing Card layouts */
      .architecture-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 48px;
      }

      .architecture-col, .docs-index-item {
        position: relative;
        background: var(--bg-card);
        border: 1px solid var(--line);
        border-radius: 24px;
        padding: 40px;
        box-shadow: var(--shadow);
        text-align: left;
        overflow: hidden;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
      }

      /* spotlight radial gradient mask */
      .architecture-col::before, .docs-index-item::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        background: radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(0, 242, 254, 0.12), transparent 80%);
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: 0;
      }
      .architecture-col:hover::before, .docs-index-item:hover::before {
        opacity: 1;
      }
      
      /* Glowing border stroke highlight */
      .architecture-col:hover, .docs-index-item:hover {
        border-color: rgba(0, 242, 254, 0.25);
        box-shadow: 0 15px 35px rgba(0, 242, 254, 0.04), 0 1px 3px rgba(0, 242, 254, 0.02);
      }

      .architecture-col *, .docs-index-item * {
        position: relative;
        z-index: 1;
      }
      
      .architecture-col h3 {
        font-family: var(--font-discord);
        font-size: 21px;
        font-weight: 800;
        margin: 0 0 12px;
        color: var(--text);
        letter-spacing: -0.01em;
      }
      
      .architecture-col p {
        margin: 0 0 36px;
        color: var(--text-soft);
        line-height: 1.7;
        font-size: 15.5px;
      }
      .architecture-col p:last-child {
        margin-bottom: 0;
      }

      /* Clean Default Document Center Links */
      .docs-index-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .docs-index-item {
        padding: 32px;
        text-decoration: none;
        color: inherit;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: block;
      }
      .docs-index-item:hover {
        transform: translateY(-2px);
      }
      .docs-index-meta {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: var(--discord);
        margin-bottom: 8px;
      }
      .docs-index-title {
        font-family: var(--font-discord);
        font-size: 22px;
        font-weight: 900;
        margin: 0 0 8px;
        color: var(--text);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .docs-index-title .arrow {
        transition: transform 0.2s ease;
      }
      .docs-index-item:hover .docs-index-title .arrow {
        transform: translateX(4px);
      }
      .docs-index-summary {
        margin: 0;
        color: var(--text-soft);
        font-size: 14.5px;
        line-height: 1.6;
      }

      /* Interactive Private Beta Modal */
      .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .modal-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }
      .modal-box {
        background: var(--bg-card);
        border: 1px solid rgba(88, 101, 242, 0.15);
        border-radius: 28px;
        padding: clamp(24px, 5vw, 48px);
        width: min(540px, calc(100% - 32px));
        box-shadow: 0 30px 60px rgba(15, 23, 42, 0.15);
        transform: translateY(24px) scale(0.96);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        text-align: center;
      }
      .modal-overlay.active .modal-box {
        transform: translateY(0) scale(1);
      }
      .modal-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        background: rgba(88, 101, 242, 0.08);
        color: var(--discord);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        font-size: 32px;
        font-weight: 800;
      }
      .modal-box h3 {
        margin: 0 0 12px;
        font-family: var(--font-discord);
        font-size: 24px;
        font-weight: 900;
      }
      .modal-box p {
        color: var(--text-soft);
        line-height: 1.6;
        font-size: 15px;
        margin: 0 0 28px;
      }
      .modal-btn {
        width: 100%;
        border: none;
        padding: 14px;
        border-radius: 40px;
        background: var(--discord);
        color: #ffffff;
        font-weight: 600;
        font-size: 15.5px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .modal-btn:hover {
        background: var(--discord-hover);
        box-shadow: 0 8px 20px rgba(88, 101, 242, 0.25);
      }

      /* Footer */
      .footer {
        background: #0f172a;
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
        grid-template-columns: 1.5fr repeat(4, 1fr);
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

      @media (max-width: 1080px) {
        .architecture-layout { grid-template-columns: 1fr; gap: 32px; }
        .footer-top { grid-template-columns: 1.2fr repeat(2, 1fr); gap: 32px; }
      }

      @media (max-width: 768px) {
        :root { --topbar-h: 72px; }
        .menu { display: none; }
        .footer-top { grid-template-columns: 1fr; gap: 24px; }
        .footer-brand { margin-bottom: 16px; }
      }
    </style>
  </head>
  <body>
    <div class="bg-glow-1"></div>
    <div class="bg-glow-2"></div>

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

    <main>
      <section class="hero">
        <!-- Stunning HTML5 Canvas particle & ASCII matrix text reveal container -->
        <div class="canvas-container">
          <canvas id="hero-particles"></canvas>
        </div>

        <h1>Communicate without limits or <span>fear of surveillance</span></h1>
        <p>TheGraphT is a resilient, secure, and technologically advanced messenger built for professionals. Our secure Web Client and modern communication layer ensure you own your data.</p>
        
        <div class="cta-buttons">
          <a href="https://web.thegrapht.su" class="cta-btn-primary">Open Web Client</a>
          <button class="cta-btn-secondary" id="download-win-btn">Download for Windows</button>
        </div>
      </section>

      <section class="section reveal-on-scroll">
        <h2 class="section-title">Resilient Architecture. Absolute Integrity.</h2>
        <p class="section-desc">We do not hide behind vague marketing buzzwords. Below is a raw, transparent overview of the technical components actively operating on our backend.</p>
        
        <div class="architecture-layout">
          <div class="architecture-col reveal-on-scroll stagger-1">
            <h3>Realtime Sync Engine</h3>
            <p>Our transport layer is driven by continuous bidirectional WebSockets. This delivers instant message dispatches, presence updates, and dynamic typing signals without inefficient client polling cycles.</p>
            
            <h3>Enterprise Persistence</h3>
            <p>Multi-user chats and historical messages are stored and structured cleanly using PostgreSQL. Relational models ensure strictly consistent message order, zero duplication, and safe query isolation.</p>
          </div>
          
          <div class="architecture-col reveal-on-scroll stagger-2">
            <h3>Session Hardening</h3>
            <p>All state-mutating requests undergo strict client Origin validation. Active session hashes are stored in highly secure, server-managed <code>HttpOnly</code>, <code>Secure</code>, and <code>SameSite</code> cookies to prevent client-side XSS leakage.</p>
            
            <h3>Attachment Validation Gateway</h3>
            <p>Uploaded media assets undergo direct server-side byte analysis (magic bytes verification) rather than relying solely on file extensions. Inbound payloads are strictly sandboxed against path-traversal exploits.</p>
          </div>
        </div>
      </section>

      <section class="section reveal-on-scroll">
        <h2 class="section-title">Technical Documentation Specification</h2>
        <p class="section-desc">Deep-dive into the technical implementation and architecture across different specialized pages.</p>
        
        <div class="docs-index-list">
          <a href="/product" class="docs-index-item reveal-on-scroll stagger-1">
            <div class="docs-index-meta">01 / OVERVIEW</div>
            <div class="docs-index-title">Product Roadmap & Status <span class="arrow">→</span></div>
            <p class="docs-index-summary">Explore the development phases, active web features, and the upcoming Electron desktop release plan.</p>
          </a>
          
          <a href="/security" class="docs-index-item reveal-on-scroll stagger-2">
            <div class="docs-index-meta">02 / CRYPTO & SESSIONS</div>
            <div class="docs-index-title">Security Model & Credentials <span class="arrow">→</span></div>
            <p class="docs-index-summary">Analyze our session cookies, password protection hashes, and cross-site request security barriers.</p>
          </a>
          
          <a href="/technologies" class="docs-index-item reveal-on-scroll stagger-3">
            <div class="docs-index-meta">03 / STACK & ENGINE</div>
            <div class="docs-index-title">Infrastructure & Tech Stack <span class="arrow">→</span></div>
            <p class="docs-index-summary">Review the WebSocket protocol specifications, database schemas, and isolated Docker network structures.</p>
          </a>
        </div>
      </section>
    </main>

    <!-- Interactive Cyber Modal Box -->
    <div class="modal-overlay" id="beta-modal">
      <div class="modal-box">
        <div class="modal-icon">⚙️</div>
        <h3>Desktop Private Beta</h3>
        <p>The native Electron Desktop Client (v0.2.4) is currently in active closed beta testing. Binary installer distribution will be deployed publically on our target release date: <strong>May 29, 2026</strong>. In the meantime, use our production Web Client!</p>
        <button class="modal-btn" id="close-modal-btn">Acknowledge</button>
      </div>
    </div>

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
            <h4>Product</h4>
            <a href="https://web.thegrapht.su">Open Web Client</a>
            <a href="/product">Roadmap & Status</a>
          </div>
          <div class="footer-col">
            <h4>Security</h4>
            <a href="/security">Security Model</a>
            <a href="/privacy">Data Handling</a>
          </div>
          <div class="footer-col">
            <h4>Engine</h4>
            <a href="/technologies">WebSocket & Schema</a>
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

        document.querySelectorAll('.architecture-col, .docs-index-item').forEach(card => {
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

        // --- 3. Interactive Private Beta Modal Handler ---
        const winBtn = document.getElementById('download-win-btn');
        const modal = document.getElementById('beta-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');

        if (winBtn && modal && closeModalBtn) {
          winBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
          });

          closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
          });

          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              modal.classList.remove('active');
            }
          });
        }

        // --- 4. stunning Canvas Particle & ASCII Text Reveal Animation ---
        const canvas = document.getElementById('hero-particles');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          let width = canvas.width = Math.max(850, canvas.offsetWidth || 850);
          let height = canvas.height = Math.max(180, canvas.offsetHeight || 180);
          
          let particles = [];
          const mouse = { x: null, y: null, radius: 95 };
          const chars = '01+{}[]*x&?#$@%!'.split('');

          // Resize handler
          window.addEventListener('resize', () => {
            const currentW = Math.max(850, canvas.offsetWidth || 850);
            const currentH = Math.max(180, canvas.offsetHeight || 180);
            if (currentW !== width || currentH !== height) {
              width = canvas.width = currentW;
              height = canvas.height = currentH;
              initParticles();
            }
          });

          // Mouse tracking relative to canvas
          window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
          });

          window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
          });

          function initParticles() {
            particles = [];
            
            const w = width > 0 ? width : 850;
            const h = height > 0 ? height : 180;

            // Create a temporary off-screen canvas to extract pixel coordinates of target text
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = w;
            tempCanvas.height = h;

            // Draw "{ THEGRAPHT }" centered in high visibility
            const fontSize = Math.min(76, Math.floor(w / 11));
            tempCtx.fillStyle = '#ffffff';
            tempCtx.font = \`900 \${fontSize}px "Inter", sans-serif\`;
            tempCtx.textAlign = 'center';
            tempCtx.textBaseline = 'middle';
            tempCtx.fillText('{ THEGRAPHT }', w / 2, h / 2);

            const imgData = tempCtx.getImageData(0, 0, w, h);
            const data = imgData.data;

            const cellSpacing = 11; // Dense grid spacing
            const cols = Math.ceil(w / cellSpacing);
            const rows = Math.ceil(h / cellSpacing);

            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const gx = c * cellSpacing + cellSpacing / 2;
                const gy = r * cellSpacing + cellSpacing / 2;
                
                // Get alpha pixel value from text mask
                const pixelX = Math.floor(gx);
                const pixelY = Math.floor(gy);
                let isText = false;
                
                if (pixelX >= 0 && pixelX < w && pixelY >= 0 && pixelY < h) {
                  const idx = (pixelY * w + pixelX) * 4;
                  if (data[idx + 3] > 70) {
                    isText = true;
                  }
                }

                particles.push({
                  gx: gx,
                  gy: gy,
                  x: gx,
                  y: gy,
                  offsetX: (Math.random() - 0.5) * w * 0.15, // Smooth initial scatter
                  offsetY: (Math.random() - 0.5) * h * 0.15,
                  vx: 0,
                  vy: 0,
                  isText: isText,
                  char: chars[Math.floor(Math.random() * chars.length)],
                  // Vibrant neon colors inside text, soft dark slate outside
                  color: isText 
                    ? (Math.random() > 0.4 ? '#00f2fe' : '#7f00ff') 
                    : '#334155',
                  baseAlpha: isText ? 0.35 + Math.random() * 0.45 : 0.04 + Math.random() * 0.05,
                  alpha: 0, 
                  friction: 0.84,
                  spring: 0.075
                });
              }
            }
          }

          function animate() {
            const w = width > 0 ? width : 850;
            const h = height > 0 ? height : 180;
            ctx.clearRect(0, 0, w, h);

            // Subtle matrix grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
            ctx.lineWidth = 1;
            const gridSpacing = 24;
            for (let x = 0; x < w; x += gridSpacing) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, h);
              ctx.stroke();
            }
            for (let y = 0; y < h; y += gridSpacing) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(w, y);
              ctx.stroke();
            }

            // Animate cells
            for (let i = 0; i < particles.length; i++) {
              const p = particles[i];
              
              // Spring back offsets
              let ax = (0 - p.offsetX) * p.spring;
              let ay = (0 - p.offsetY) * p.spring;
              p.vx += ax;
              p.vy += ay;
              p.vx *= p.friction;
              p.vy *= p.friction;
              p.offsetX += p.vx;
              p.offsetY += p.vy;

              p.x = p.gx + p.offsetX;
              p.y = p.gy + p.offsetY;

              let targetAlpha = p.baseAlpha;
              let drawColor = p.color;

              if (mouse.x !== null && mouse.y !== null) {
                let dx = p.gx - mouse.x;
                let dy = p.gy - mouse.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                  let force = (mouse.radius - dist) / mouse.radius;
                  
                  // Radial scatter repulsion
                  p.vx += (dx / dist) * force * 3.5;
                  p.vy += (dy / dist) * force * 3.5;

                  // Maximum spotlight brightness
                  targetAlpha = p.isText ? 1.0 : 0.4;
                  drawColor = p.isText ? '#00f2fe' : '#7f00ff';

                  // Dynamic character scrambling inside spotlight
                  if (Math.random() > 0.88) {
                    p.char = chars[Math.floor(Math.random() * chars.length)];
                  }
                }
              }

              p.alpha += (targetAlpha - p.alpha) * 0.12;

              if (Math.random() > 0.995) {
                p.char = chars[Math.floor(Math.random() * chars.length)];
              }

              // Draw ASCII Matrix grid cell
              ctx.fillStyle = drawColor;
              ctx.font = p.isText ? '900 11px monospace' : '400 9px monospace';
              ctx.globalAlpha = p.alpha;
              ctx.fillText(p.char, p.x, p.y);
            }

            ctx.globalAlpha = 1.0;
            requestAnimationFrame(animate);
          }

          initParticles();
          animate();
        }
      });
    </script>
  </body>
</html>`;