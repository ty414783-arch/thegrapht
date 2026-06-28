import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lucideIconsDir = path.resolve(__dirname, "../apps/frontend/node_modules/lucide-static/icons");

const mapping = {
  'menu': 'menu',
  'edit': 'edit-2',
  'edit-2': 'edit-2',
  'person': 'user',
  'bookmark': 'bookmark',
  'logout': 'log-out',
  'auto_awesome': 'sparkles',
  'keyboard_arrow_down': 'chevron-down',
  'close': 'x',
  'mode_fan': 'wind',
  'check': 'check',
  'lock': 'lock',
  'arrow_upward': 'arrow-up',
  'campaign': 'megaphone',
  'groups': 'users',
  'arrow_back': 'arrow-left',
  'add_a_photo': 'camera',
  'arrow_forward': 'arrow-right',
  'more_vert': 'more-vertical',
  'alternate_email': 'at-sign',
  'notifications': 'bell',
  'chevron_right': 'chevron-right',
  'storage': 'database',
  'settings': 'settings',
  'folder': 'folder',
  'mood': 'smile',
  'devices': 'laptop',
  'translate': 'languages',
  'star': 'star',
  'call_end': 'phone-off',
  'fast_rewind': 'rewind',
  'pause': 'pause',
  'play_arrow': 'play',
  'fast_forward': 'fast-forward',
  'volume_up': 'volume-2',
  'volume_off': 'volume-x',
  'mic': 'mic',
  'mic_off': 'mic-off',
  'screen_share': 'monitor-up',
  'open_in_new': 'external-link',
  'reply': 'corner-up-left',
  'download': 'download',
  'delete': 'trash-2',
  'error': 'alert-triangle',
  'gif_box': 'file-image',
  'autorenew': 'refresh-cw',
  'search': 'search',
  'send': 'send',
  'volume_mute': 'volume-x',
  'open_in_full': 'expand',
  'close_fullscreen': 'shrink',
  'south': 'arrow-down',
  'volume_down': 'volume-1',
  'videocam_off': 'video-off',
  'videocam': 'video',
  'call': 'phone',
  'stop_screen_share': 'monitor-off',
  'repeat': 'repeat',
  'sentiment_satisfied': 'smile',
  'photo_library': 'image',
  'draft': 'file',
  'content_copy': 'copy',
  'chat': 'message-square',
  'call_made': 'phone-outgoing',
  'call_received': 'phone-incoming'
};

const compile = () => {
  const result = {};
  const processed = new Set();

  for (const [googleName, lucideName] of Object.entries(mapping)) {
    if (processed.has(lucideName)) {
      continue;
    }
    const svgPath = path.join(lucideIconsDir, `${lucideName}.svg`);
    if (!fs.existsSync(svgPath)) {
      console.error(`SVG not found for lucide name "${lucideName}" (mapped from "${googleName}")`);
      continue;
    }
    const content = fs.readFileSync(svgPath, "utf-8");
    // Extract inner HTML of the SVG (everything between the first <svg ...> and </svg>)
    const match = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    if (!match) {
      console.error(`Failed to parse SVG for "${lucideName}"`);
      continue;
    }
    let innerContent = match[1].trim();
    // Normalize spaces and quotes
    innerContent = innerContent.replace(/\s+/g, " ").replace(/"/g, "'");
    result[lucideName] = innerContent;
    processed.add(lucideName);
  }

  console.log("const lucideSvgs = {");
  for (const [name, svg] of Object.entries(result)) {
    console.log(`  '${name}': "${svg}",`);
  }
  console.log("};");
};

compile();
