import styles from "./DaySeparator.module.css";

type DaySeparatorProps = {
  label: string;
};

export function DaySeparator({ label }: DaySeparatorProps) {
  if (!label) {
    return null;
  }

  return (
    <div class={styles.separator} role="separator" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}
