import type { LegacyViewerAuthorAvatarState } from "./legacyViewerModalSync.ts";

type LegacyViewerAuthorAvatarProps = {
  avatar: LegacyViewerAuthorAvatarState;
};

export function LegacyViewerAuthorAvatar({ avatar }: LegacyViewerAuthorAvatarProps) {
  if (avatar.kind === "image") {
    return (
      <img
        class="generated-avatar-photo"
        src={avatar.url}
        alt={avatar.alt}
        style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
      />
    );
  }

  return <>{avatar.letter}</>;
}

export function getLegacyViewerAuthorAvatarStyle(avatar: LegacyViewerAuthorAvatarState): string | undefined {
  return avatar.kind === "letter" && avatar.style ? avatar.style : undefined;
}
