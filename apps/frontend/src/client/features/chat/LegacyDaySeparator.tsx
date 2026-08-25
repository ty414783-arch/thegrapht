export type LegacyDaySeparatorProps = {
  dayTs: string;
  label: string;
};

export function LegacyDaySeparator({ dayTs, label }: LegacyDaySeparatorProps) {
  if (!dayTs || !label) {
    return null;
  }

  return (
    <div class="message-day-separator" data-day-ts={dayTs}>
      <span>{label}</span>
    </div>
  );
}
