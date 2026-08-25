export type LegacyProfileMemberRowProps = {
  userId: string;
  displayName: string;
  statusText: string;
  roleLabel: string;
  avatarStyle: string;
  avatarUrl: string;
  avatarLetter: string;
};

export function LegacyProfileMemberRow({
  userId,
  displayName,
  statusText,
  roleLabel,
  avatarStyle,
  avatarUrl,
  avatarLetter
}: LegacyProfileMemberRowProps) {
  return (
    <div class="group-member-row" data-member-user-id={userId}>
      <div
        class="dialog-avatar user-avatar group-member-avatar"
        style={avatarStyle ? avatarStyle : undefined}
      >
        <img
          class="generated-avatar-photo"
          src={avatarUrl}
          alt={avatarLetter || "?"}
        />
      </div>
      <div class="group-member-main">
        <div class="group-member-name">{displayName}</div>
        <div class="group-member-status">{statusText}</div>
      </div>
      <div class="group-member-role">{roleLabel}</div>
    </div>
  );
}
