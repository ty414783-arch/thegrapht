/** Material Design circular indeterminate progress (Google 4-color spinner). */
export const googleSpinnerMarkup = (size = 48) =>
  `<div class="gspinner" style="width:${size}px;height:${size}px" role="progressbar" aria-label="Loading">` +
  `<svg class="gspinner-circular" viewBox="25 25 50 50" aria-hidden="true">` +
  `<circle class="gspinner-path" cx="50" cy="50" r="20" fill="none" stroke-width="3.6" stroke-miterlimit="10"></circle>` +
  `</svg></div>`;

export const googleSpinnerStyles = `
      html:has(.page.booting),
      body:has(.page.booting) {
        background: #ffffff !important;
      }
      .gspinner-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .gspinner {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        flex-shrink: 0;
        position: relative;
      }
      .gspinner-circular {
        display: block;
        width: 100%;
        height: 100%;
        animation: gspinner-rotate 2s linear infinite;
        transform-origin: center center;
      }
      .gspinner-path {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
        stroke-linecap: round;
        animation: gspinner-dash 1.5s ease-in-out infinite, gspinner-color 6s ease-in-out infinite;
      }
      @keyframes gspinner-rotate {
        100% { transform: rotate(360deg); }
      }
      @keyframes gspinner-dash {
        0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
        50% { stroke-dasharray: 89, 200; stroke-dashoffset: -35px; }
        100% { stroke-dasharray: 89, 200; stroke-dashoffset: -124px; }
      }
      @keyframes gspinner-color {
        100%, 0% { stroke: #ea4335; }
        40% { stroke: #4285f4; }
        66% { stroke: #34a853; }
        80%, 90% { stroke: #fbbc05; }
      }
      .boot-splash {
        position: fixed !important;
        inset: 0 !important;
        z-index: 2147483000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: #ffffff !important;
        opacity: 1;
        transition: opacity 0.22s ease, visibility 0.22s ease;
      }
      .boot-splash.hidden {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      #boot-splash:not(.hidden) ~ .auth-bg-canvas,
      body:has(.page.booting) .auth-bg-canvas,
      html:has(.page.booting) .auth-bg-canvas,
      body:has(.page.booting) .page.workspace-mode::before {
        display: none !important;
      }
      .m3-spinner-container .gspinner {
        width: 36px;
        height: 36px;
      }
      .search-loading-state .gspinner,
      .chat-spinner-container .gspinner,
      .chat-loading-overlay .gspinner {
        width: 40px;
        height: 40px;
      }
      @media (prefers-reduced-motion: reduce) {
        .gspinner-circular,
        .gspinner-path {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
        }
      }
`;
