const parseUiFlag = (rawValue, fallback) => {
  if (rawValue == null || rawValue === "") {
    return fallback;
  }

  return /^(1|true|yes|on)$/i.test(String(rawValue).trim());
};

export const uiFlags = Object.freeze({
  telegramTopBar: parseUiFlag(process.env.UI_TELEGRAM_TOP_BAR, true),
  desktopInterFont: parseUiFlag(process.env.UI_DESKTOP_INTER_FONT, true),
  desktopSideGuttersOnly: parseUiFlag(process.env.UI_DESKTOP_SIDE_GUTTERS_ONLY, true),
  sidebarAccountCardHidden: parseUiFlag(process.env.UI_SIDEBAR_ACCOUNT_CARD_HIDDEN, true),
  newChatUi: parseUiFlag(process.env.UI_NEW_CHAT_UI, false),
  newSidebar: parseUiFlag(process.env.UI_NEW_SIDEBAR, false),
  newAuthUi: parseUiFlag(process.env.UI_NEW_AUTH_UI, false)
});
