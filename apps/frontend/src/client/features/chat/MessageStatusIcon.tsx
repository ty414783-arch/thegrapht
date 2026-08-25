const pendingIcon = (
  <svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true">
    <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="1.4" />
    <path d="M10 6.5v3.9l2.6 1.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
  </svg>
);

const singleCheck = (
  <svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M3.5 10.5l4 3.8 8.8-8" />
  </svg>
);

const doubleCheck = (
  <svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M2.5 10.5l3.8 3.8 7.8-8M7.1 10.5l3.8 3.8L17.5 7" />
  </svg>
);

type MessageStatusIconProps = {
  state: "pending" | "failed" | "sent" | "read" | "none";
  dialogType?: string;
};

export function MessageStatusIcon({ state }: MessageStatusIconProps) {
  if (state === "none") return null;

  if (state === "pending") {
    return <span class="message-status-icon is-pending" aria-label="Pending">{pendingIcon}</span>;
  }

  if (state === "failed") {
    return <span class="message-status-icon is-failed" aria-label="Failed">!</span>;
  }

  if (state === "read") {
    return <span class="message-status-icon message-checks-double">{doubleCheck}</span>;
  }

  return <span class="message-status-icon message-checks-single">{singleCheck}</span>;
}
