export const buildFaqHtml = ({
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
    <title>Documentation & Specs Center — TheGraphT</title>
    <meta name="description" content="Technical whitepaper, security model, API specs, and product roadmap for TheGraphT communication platform." />
    <noscript>
      <style>
        .article-section {
          display: block !important;
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
        /* Global Dot Matrix Blueprint Pattern */
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

      .hero {
        width: min(1200px, calc(100% - 32px));
        margin: 0 auto 32px;
        border: 1px solid var(--line);
        border-radius: 24px;
        padding: clamp(32px, 5vw, 56px);
        background: var(--bg-card);
        box-shadow: var(--shadow);
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
        font-size: clamp(15px, 1.8vw, 18px);
        max-width: 800px;
      }

      .layout {
        width: min(1200px, calc(100% - 32px));
        margin: 0 auto 64px;
        display: grid;
        grid-template-columns: 280px minmax(0, 1fr);
        gap: 32px;
      }

      /* Sidebar & Articles spotlight layout */
      .sidebar {
        position: sticky;
        top: calc(var(--topbar-h) + 24px);
        align-self: start;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: var(--bg-card);
        padding: 24px;
        box-shadow: var(--shadow);
        max-height: calc(100vh - var(--topbar-h) - 48px);
        overflow-y: auto;
      }
      
      .sidebar h3 {
        margin: 0 0 16px;
        font-family: var(--font-discord);
        font-size: 12px;
        text-transform: uppercase;
        color: var(--text-soft);
        letter-spacing: 0.05em;
        font-weight: 800;
      }
      
      .sidebar a {
        display: block;
        text-decoration: none;
        color: var(--text-soft);
        padding: 10px 12px;
        font-weight: 600;
        font-size: 14.5px;
        border-radius: 8px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        margin-bottom: 4px;
      }
      
      .sidebar a:hover {
        background: rgba(88, 101, 242, 0.08);
        color: #ffffff;
        padding-left: 16px;
      }

      .sidebar a.active {
        background: var(--discord);
        color: #ffffff;
        padding-left: 16px;
      }

      .articles { display: block; }
      
      /* Beautiful spotlight containers for sections */
      .article-section {
        display: none;
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid var(--line);
        border-radius: 24px;
        background: var(--bg-card);
        padding: clamp(24px, 5vw, 48px);
        box-shadow: var(--shadow);
        position: relative;
        overflow: hidden;
      }

      .article-section::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        background: radial-gradient(400px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(0, 242, 254, 0.12), transparent 80%);
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: 0;
      }
      .article-section:hover::before {
        opacity: 1;
      }

      .article-section * {
        position: relative;
        z-index: 1;
      }
      
      .article-section h2 {
        margin: 0 0 24px;
        font-family: var(--font-discord);
        font-size: 32px;
        font-weight: 900;
        letter-spacing: -0.02em;
        color: var(--text);
        border-bottom: 2px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 16px;
      }
      
      .article-section h3 {
        margin: 36px 0 16px;
        font-family: var(--font-discord);
        font-size: 21px;
        font-weight: 800;
        color: var(--text);
      }
      
      .article-section p, .article-section li {
        color: var(--text-soft);
        line-height: 1.75;
        font-size: 15.5px;
      }
      
      .article-section ul {
        margin: 16px 0 0;
        padding-left: 20px;
      }
      
      .article-section li {
        margin-bottom: 10px;
      }

      /* Premium Technical Code blocks styles */
      .article-section code {
        background: rgba(255, 255, 255, 0.06);
        color: #f8fafc;
        padding: 3px 7px;
        border-radius: 6px;
        font-family: Consolas, Monaco, "Andale Mono", monospace;
        font-size: 13.5px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .code-block-wrapper {
        margin: 20px 0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--line);
        background: #090d16;
        box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);
      }
      .code-block-header {
        background: #111724;
        padding: 10px 16px;
        color: #94a3b8;
        font-size: 12px;
        font-family: monospace;
        text-transform: uppercase;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex;
        justify-content: space-between;
      }
      .code-block-wrapper pre {
        margin: 0;
        padding: 16px;
        overflow-x: auto;
      }
      .code-block-wrapper code {
        background: transparent !important;
        border: none !important;
        color: #e2e8f0;
        font-family: "Courier New", Courier, monospace;
        font-size: 13px;
        padding: 0 !important;
      }

      /* Sharp Neo-brutalist Specification Tables */
      .spec-table {
        width: 100%;
        border-collapse: collapse;
        margin: 24px 0;
        font-size: 14.5px;
        text-align: left;
      }
      .spec-table th {
        background: rgba(255, 255, 255, 0.03);
        color: var(--text);
        font-weight: 700;
        padding: 14px 16px;
        border-bottom: 2px solid rgba(255, 255, 255, 0.08);
        font-family: var(--font-discord);
      }
      .spec-table td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--line);
        color: var(--text-soft);
      }
      .spec-table tr:hover {
        background: rgba(255, 255, 255, 0.015);
      }

      /* Gorgeous alert notification blocks */
      .alert-box {
        background: rgba(88, 101, 242, 0.08);
        border-left: 4px solid var(--discord);
        border-radius: 0 12px 12px 0;
        padding: 20px;
        margin: 24px 0;
      }
      .alert-box-title {
        font-weight: 700;
        color: var(--text);
        margin-bottom: 6px;
        font-family: var(--font-discord);
        display: flex;
        align-items: center;
        gap: 8px;
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
        .layout { grid-template-columns: 1fr; }
        .sidebar { position: static; max-height: none; }
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
        <h1>Technical Documentation & Spec Center</h1>
        <p>Explore the engineering principles, underlying architecture, cryptographic models, and roadmap milestones driving the development of TheGraphT platform.</p>
      </section>

      <div class="layout">
        <aside class="sidebar">
          <h3>Documentation</h3>
          <a href="/product">Product Roadmap</a>
          <a href="/security">Security Model</a>
          <a href="/technologies">Tech Stack & Specs</a>
        </aside>

        <section class="articles">
          <!-- SECTION 1: PRODUCT ROADMAP -->
          <article class="article-section" id="sec-product">
            <h2>Product Overview & Roadmap</h2>
            <p>TheGraphT is a high-performance communication platform developed with a focus on real-time event updates, zero third-party telemetry, and absolute database integrity. We write about real, fully functioning backend capabilities and direct milestones.</p>
            
            <h3>Client Deployments Status</h3>
            <table class="spec-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Version</th>
                  <th>Core Engine</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Web Messenger</strong></td>
                  <td>v0.1.2</td>
                  <td>Vanilla JS / WebSockets</td>
                  <td><span style="color: #10b981; font-weight:600;">● Active Production</span></td>
                </tr>
                <tr>
                  <td><strong>Electron Native</strong></td>
                  <td>v0.2.4</td>
                  <td>React / Vite / Context Bridge</td>
                  <td><span style="color: #f59e0b; font-weight:600;">● Closed Beta</span></td>
                </tr>
                <tr>
                  <td><strong>Android Native</strong></td>
                  <td>v0.1.2-alpha</td>
                  <td>Kotlin / MTProto Gateway</td>
                  <td><span style="color: #64748b; font-weight:600;">○ Internal Audit</span></td>
                </tr>
              </tbody>
            </table>

            <div class="alert-box">
              <div class="alert-box-title">⚙️ Electron Sandbox Configuration</div>
              <p>The Electron Native client isolates browser UI execution from the host operating system by enforcing <code>contextIsolation: true</code>. Direct node APIs are completely barred inside client modules, routing commands strictly through an audited preload interface.</p>
            </div>

            <p>Our Electron client operates in a zero-privilege sandboxed environment. Native APIs (including filesystem access, shell execution, and raw socket creation) are completely barred within the application context. Inter-process communication is routed exclusively through a whitelist of application-specific channels via a secure preload bridge. This guarantees that even if a visual component encounters an execution vulnerability, it cannot escape the native process sandbox or access the underlying operating system.</p>

            <h3>Targeted Project Milestones</h3>
            <ul>
              <li><strong>Phase 1: Foundation (Completed)</strong>: Creation of the PostgreSQL schema, HTTP REST endpoints integration, cookie-based session verification, and WebSocket gateway.</li>
              <li><strong>Phase 2: Group Chat Scaling (Active)</strong>: Fine-grained user role permissions, real-time message read metrics, and optimized server buffering.</li>
              <li><strong>Phase 3: Public Release (Targeted May 29, 2026)</strong>: Public distribution of macOS, Linux, and Windows binary installers, independent security audit publishing, and repository open-sourcing.</li>
            </ul>
          </article>

          <!-- SECTION 2: SECURITY MODEL -->
          <article class="article-section" id="sec-security">
            <h2>Security Model & Credentials</h2>
            <p>Our security design focuses on isolating authorization tokens from active script boundaries and ensuring strict verification processes for every state-altering payload.</p>
            
            <h3>Cookie-Based Session Isolation</h3>
            <p>Most modern web platforms store authorization keys (like JWTs or access hashes) directly inside browser <code>localStorage</code> or <code>sessionStorage</code>. This exposes tokens directly to malicious extensions or scripting attacks (XSS).</p>
            <p>TheGraphT completely avoids storage-level vectors. All session tokens are handled exclusively via cookies protected with the following server-enforced flags:</p>
            
            <table class="spec-table">
              <thead>
                <tr>
                  <th>Flag</th>
                  <th>Technical Constraint</th>
                  <th>Mitigates</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>HttpOnly</code></td>
                  <td>Blocks any read or write attempts through JavaScript API contexts (e.g., <code>document.cookie</code>).</td>
                  <td>XSS Session Hijacking</td>
                </tr>
                <tr>
                  <td><code>Secure</code></td>
                  <td>Restricts transmission strictly to encrypted HTTPS tunnels.</td>
                  <td>Packet Sniffing / MITM</td>
                </tr>
                <tr>
                  <td><code>SameSite=Strict</code></td>
                  <td>Suppresses cookie dispatch on cross-origin resource requests.</td>
                  <td>CSRF (Cross-Site Request Forgery)</td>
                </tr>
              </tbody>
            </table>

            <h3>CSRF and Origin Barriers</h3>
            <p>To prevent malicious sites from executing commands on behalf of an authenticated user, the backend enforces rigorous validation of both <code>Origin</code> and <code>Referer</code> headers for all mutating operations.</p>
            
            <p>To prevent malicious third-party portals from executing actions on behalf of authenticated users, the gateway automatically validates request headers (such as <code>Origin</code> and <code>Referer</code>) against a strict list of allowed application domains. Any requests with mismatched, omitted, or spoofed origin headers are immediately dropped at the boundary layer with a secure HTTP 403 Forbidden response before reaching any business logic.</p>

            <h3>Password Protection Pipeline</h3>
            <p>Authentication data is transformed using the robust <code>scrypt</code> hashing function. Each password undergoes derivation with a unique, cryptographically secure salt, reinforced by a system-level pepper variable held strictly within the private environment configuration.</p>
          </article>

          <!-- SECTION 3: TECH STACK & INFRASTRUCTURE -->
          <article class="article-section" id="sec-technologies">
            <h2>Tech Stack & Infrastructure</h2>
            <p>The server backend is constructed using a reliable, low-overhead microservice model designed to isolate system components and scale efficiently.</p>
            
            <h3>Real-Time TCP Transport Framing</h3>
            <p>Rather than exhausting server CPU and network bandwidth through continuous HTTP polling, all transient interactions use persistent, full-duplex TCP channels managed by Node.js WebSockets.</p>
            
            <table class="spec-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>action</code></td>
                  <td><code>String</code></td>
                  <td>Action opcode (e.g., <code>"msg_send"</code>, <code>"typing"</code>, <code>"auth_init"</code>)</td>
                </tr>
                <tr>
                  <td><code>dialogId</code></td>
                  <td><code>Integer</code></td>
                  <td>Target dialog index inside database relations</td>
                </tr>
                <tr>
                  <td><code>payload</code></td>
                  <td><code>Object</code></td>
                  <td>Nested JSON data parameters</td>
                </tr>
                <tr>
                  <td><code>nonce</code></td>
                  <td><code>String</code></td>
                  <td>Random ID for client dispatch confirmations</td>
                </tr>
              </tbody>
            </table>

            <p>Real-time event frames are encapsulated into lightweight, structured binary and text-based packets. These packets carry safe routing opcodes, target dialog identifiers, client-generated verification nonces, and sterile payload configurations. All incoming messages are validated for size and schema conformity before database insertion, completely eliminating transport-layer vulnerabilities.</p>

            <h3>Media Assets Validation Gateway</h3>
            <p>File uploads are routed through a sandboxed validation pipeline:</p>
            <ul>
              <li><strong>Binary Analysis</strong>: The server performs immediate analysis of binary headers (magic bytes) to verify correct MIME-types, preventing disguised executables from being stored.</li>
              <li><strong>Path Traversal Prevention</strong>: Filenames are rigorously sanitized of directory traversal sequences (e.g., <code>../</code>), forcing absolute storage isolation.</li>
            </ul>

            <table class="spec-table">
              <thead>
                <tr>
                  <th>Format</th>
                  <th>Magic Bytes Signature</th>
                  <th>Verified MIME</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>PNG</strong></td>
                  <td><code>89 50 4E 47 0D 0A 1A 0A</code></td>
                  <td><code>image/png</code></td>
                </tr>
                <tr>
                  <td><strong>JPEG</strong></td>
                  <td><code>FF D8 FF E0</code></td>
                  <td><code>image/jpeg</code></td>
                </tr>
                <tr>
                  <td><strong>PDF</strong></td>
                  <td><code>25 50 44 46</code></td>
                  <td><code>application/pdf</code></td>
                </tr>
              </tbody>
            </table>
          </article>
        </section>
      </div>
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
        // --- 1. Spotlight Mouse Glow Tracking ---
        const handleMouseMove = (e, element) => {
          const rect = element.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          element.style.setProperty('--mouse-x', \`\${x}px\`);
          element.style.setProperty('--mouse-y', \`\${y}px\`);
        };

        document.querySelectorAll('.article-section').forEach(sec => {
          sec.addEventListener('mousemove', (e) => handleMouseMove(e, sec));
        });

        // --- 2. Dynamic SPA Routing Section Handling ---
        const sections = {
          '/product': document.getElementById('sec-product'),
          '/security': document.getElementById('sec-security'),
          '/technologies': document.getElementById('sec-technologies')
        };

        function showSection(path) {
          let activePath = path;
          // Normalize path: if /faq or empty, default to /product
          if (activePath === '/faq' || activePath === '/faq/' || activePath === '/') {
            activePath = '/product';
          }
          // Support legacy /faq/ prefix
          if (activePath.startsWith('/faq/')) {
            activePath = activePath.replace('/faq/', '/');
          }
          // Default to /product if invalid path
          if (!sections[activePath]) {
            activePath = '/product';
          }

          // Hide all sections, show active
          Object.keys(sections).forEach(p => {
            const sec = sections[p];
            if (!sec) return;
            if (p === activePath) {
              sec.style.display = 'block';
              // trigger layout calculation for transition
              sec.offsetHeight;
              sec.style.opacity = '1';
              sec.style.transform = 'translateY(0)';
            } else {
              sec.style.display = 'none';
              sec.style.opacity = '0';
              sec.style.transform = 'translateY(12px)';
            }
          });

          // Update sidebar link highlights
          document.querySelectorAll('.sidebar a').forEach(link => {
            let linkPath = link.getAttribute('href');
            if (linkPath === activePath) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }

        // Handle navigation clicks
        document.querySelectorAll('.sidebar a, .menu a, .footer-col a').forEach(link => {
          const href = link.getAttribute('href');
          if (href && (href.startsWith('/faq/') || href === '/product' || href === '/security' || href === '/technologies')) {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              history.pushState(null, "", href);
              showSection(href);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            });
          }
        });

        // Handle popstate for browser back/forward buttons
        window.addEventListener('popstate', () => {
          showSection(window.location.pathname);
        });

        // Initial trigger based on load pathname
        showSection(window.location.pathname);
      });
    </script>
  </body>
</html>`;
