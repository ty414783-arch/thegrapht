export type LegacyEmojiPickerSection = {
  key: string;
  title: string;
  emojis: string[];
};

export const LEGACY_EMOJI_TAB_ICONS: Record<string, string> = {
  recent: "🕒",
  people: "😀",
  nature: "🌲",
  food: "🍔",
  activity: "⚽",
  travel: "🚗",
  objects: "💡",
  symbols: "❤️",
  flags: "🚩"
};

export function filterLegacyEmojiSections(
  sections: LegacyEmojiPickerSection[],
  queryStr: string
): LegacyEmojiPickerSection[] {
  if (!queryStr) {
    return sections;
  }
  const lowerQuery = queryStr.toLowerCase();
  return sections
    .map((section) => ({
      ...section,
      emojis: section.emojis.filter((emoji) => emoji.toLowerCase().includes(lowerQuery))
    }))
    .filter((section) => section.emojis.length > 0);
}

export function buildLegacyEmojiPickerSections(query: string): LegacyEmojiPickerSection[] {
  const win = window as any;
  const emojiSections = Array.isArray(win.emojiSections) ? win.emojiSections : [];
  const recentSection = {
    ...(emojiSections[0] || { key: "recent", title: "Recent", emojis: [] }),
    emojis: typeof win.readRecentEmojis === "function" ? win.readRecentEmojis() : []
  };
  let sections = [recentSection].concat(emojiSections.slice(1));
  if (query) {
    sections = filterLegacyEmojiSections(sections, query);
  }
  return sections;
}
