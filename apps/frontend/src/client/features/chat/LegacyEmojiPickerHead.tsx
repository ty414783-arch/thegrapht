import {
  LEGACY_EMOJI_TAB_ICONS,
  type LegacyEmojiPickerSection
} from "./legacyEmojiPickerSync.ts";

type LegacyEmojiPickerHeadProps = {
  sections: LegacyEmojiPickerSection[];
  activeTabKey: string | null;
  onTabClick: (key: string) => void;
};

export function LegacyEmojiPickerHead({
  sections,
  activeTabKey,
  onTabClick
}: LegacyEmojiPickerHeadProps) {
  const getEmojiAssetUrl = (window as any).getEmojiAssetUrl as ((emoji: string) => string) | undefined;

  return (
    <>
      {sections.map((section) => {
        const emojiChar = LEGACY_EMOJI_TAB_ICONS[section.key] || "";
        const tabAssetUrl = typeof getEmojiAssetUrl === "function" ? getEmojiAssetUrl(emojiChar) : "";
        const isActive = section.key === activeTabKey;

        return (
          <button
            key={section.key}
            class={"emoji-picker-tab" + (isActive ? " active" : "")}
            type="button"
            data-emoji-tab={section.key}
            aria-label={section.title}
            onClick={() => onTabClick(section.key)}
          >
            {tabAssetUrl ? (
              <img
                class="emoji-picker-tab-image"
                src={tabAssetUrl}
                alt={emojiChar}
                aria-hidden="true"
                decoding="async"
              />
            ) : (
              <span class="emoji-picker-tab-fallback">{emojiChar}</span>
            )}
          </button>
        );
      })}
    </>
  );
}
