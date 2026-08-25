import type { LegacyEmojiPickerSection } from "./legacyEmojiPickerSync.ts";

type LegacyEmojiPickerBodyProps = {
  sections: LegacyEmojiPickerSection[];
  onEmojiSelect: (emoji: string) => void;
};

export function LegacyEmojiPickerBody({ sections, onEmojiSelect }: LegacyEmojiPickerBodyProps) {
  const getEmojiAssetUrl = (window as any).getEmojiAssetUrl as ((emoji: string) => string) | undefined;

  if (sections.length === 0) {
    return <div class="emoji-picker-no-results">Ничего не найдено</div>;
  }

  return (
    <>
      {sections.map((section) => (
        <section
          key={section.key}
          class="emoji-picker-section"
          data-emoji-section={section.key}
        >
          <p class="emoji-picker-title">{section.title}</p>
          {section.emojis.length ? (
            <div class="emoji-picker-grid">
              {section.emojis.map((emoji) => {
                const emojiAssetUrl = typeof getEmojiAssetUrl === "function"
                  ? getEmojiAssetUrl(emoji)
                  : "";

                return (
                  <button
                    key={`${section.key}-${emoji}`}
                    class="emoji-button"
                    type="button"
                    data-emoji-value={emoji}
                    aria-label={emoji}
                    onClick={() => onEmojiSelect(emoji)}
                  >
                    {emojiAssetUrl ? (
                      <img
                        class="emoji-button-image"
                        src={emojiAssetUrl}
                        alt={emoji}
                        aria-hidden="true"
                        decoding="async"
                      />
                    ) : (
                      <span class="emoji-button-image" aria-hidden="true">{emoji}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div class="emoji-picker-title">Nothing here yet</div>
          )}
        </section>
      ))}
    </>
  );
}
