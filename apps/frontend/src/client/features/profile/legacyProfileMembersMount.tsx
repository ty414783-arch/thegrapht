import { h, render } from "preact";
import { LegacyProfileMemberRow, type LegacyProfileMemberRowProps } from "./LegacyProfileMemberRow.tsx";

export function mountLegacyProfileMembersList(
  container: HTMLElement,
  members: LegacyProfileMemberRowProps[]
) {
  render(
    h(
      "div",
      { style: { display: "contents" } },
      members.map((member) => h(LegacyProfileMemberRow, member))
    ),
    container
  );
}

export function clearLegacyProfileMembersList(container: HTMLElement) {
  render(null, container);
}
