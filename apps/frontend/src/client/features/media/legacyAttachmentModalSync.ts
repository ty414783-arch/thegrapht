export type LegacyAttachmentFileItem = {
  index: number;
  name: string;
  meta: string;
  isActive: boolean;
  isAudio: boolean;
};

export type LegacyAttachmentCollageItem = {
  index: number;
  previewUrl: string;
  alt: string;
};

const getFormatDuration = () => {
  const formatDuration = (window as any).formatDuration;
  return typeof formatDuration === "function" ? formatDuration : () => "";
};

const getFormatBytes = () => {
  const formatBytes = (window as any).formatBytes;
  return typeof formatBytes === "function" ? formatBytes : () => "";
};

export function buildLegacyAttachmentFileItems(
  attachments: any[],
  activeIndex: number
): LegacyAttachmentFileItem[] {
  const formatDuration = getFormatDuration();
  const formatBytes = getFormatBytes();

  return attachments.map((entry, index) => {
    const isAudio = Boolean(
      String(entry.file?.type || "").startsWith("audio/")
      || entry.file?.name?.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/i)
    );
    const duration = formatDuration(Number(entry.durationSeconds) || 0);
    const size = formatBytes(Number(entry.file?.size) || 0);
    const meta = duration && size
      ? (duration + " • " + size)
      : (duration || size || "File");

    return {
      index,
      name: entry.file?.name || "File",
      meta,
      isActive: index === activeIndex,
      isAudio
    };
  });
}

export function buildLegacyAttachmentCollageItems(attachments: any[]): LegacyAttachmentCollageItem[] {
  return attachments.map((entry, index) => ({
    index,
    previewUrl: entry.previewUrl,
    alt: entry.file?.name || "Photo"
  }));
}

export function getLegacyAttachmentCollageCountClass(count: number): string {
  return "attachment-modal-collage count-" + (count <= 11 ? String(count) : "many");
}
