import { h, render } from "preact";
import { LegacyEmojiPickerBody } from "./LegacyEmojiPickerBody.tsx";
import { LegacyEmojiPickerHead } from "./LegacyEmojiPickerHead.tsx";
import { buildLegacyEmojiPickerSections } from "./legacyEmojiPickerSync.ts";

export type LegacyEmojiPickerRenderOptions = {
  headEl: HTMLElement;
  bodyEl: HTMLElement;
  query: string;
  onEmojiSelect: (emoji: string) => void;
};

let activeTabKey: string | null = null;

const scrollToEmojiSection = (bodyEl: HTMLElement, key: string) => {
  const targetSection = bodyEl.querySelector('[data-emoji-section="' + key + '"]');
  if (!(targetSection instanceof HTMLElement)) {
    return;
  }
  const targetScrollTop = targetSection.getBoundingClientRect().top
    - bodyEl.getBoundingClientRect().top
    + bodyEl.scrollTop;
  bodyEl.scrollTo({
    top: targetScrollTop,
    behavior: "smooth"
  });
};

export function renderLegacyEmojiPicker({
  headEl,
  bodyEl,
  query,
  onEmojiSelect
}: LegacyEmojiPickerRenderOptions) {
  const sections = buildLegacyEmojiPickerSections(query);
  if (!activeTabKey || !sections.some((section) => section.key === activeTabKey)) {
    activeTabKey = sections[0]?.key ?? null;
  }

  const handleTabClick = (key: string) => {
    activeTabKey = key;
    render(
      h(LegacyEmojiPickerHead, {
        sections,
        activeTabKey: key,
        onTabClick: handleTabClick
      }),
      headEl
    );
    scrollToEmojiSection(bodyEl, key);
  };

  render(
    h(LegacyEmojiPickerHead, {
      sections,
      activeTabKey,
      onTabClick: handleTabClick
    }),
    headEl
  );
  render(
    h(LegacyEmojiPickerBody, {
      sections,
      onEmojiSelect
    }),
    bodyEl
  );
}

export function resetLegacyEmojiPickerTabState() {
  activeTabKey = null;
}
