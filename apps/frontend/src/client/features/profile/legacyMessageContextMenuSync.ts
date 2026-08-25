import { t } from "../../i18n";

export type LegacyContextMenuAction = {
  key: string;
  label: string;
  iconHtml: string;
  danger: boolean;
};

export function isLegacyMessageDownloadable(message: any): boolean {
  return Boolean(
    message?.mediaUrl
    && (message.type === "image" || message.type === "video" || message.type === "audio")
  );
}

export function getLegacyContextMenuActions(message: any): LegacyContextMenuAction[] {
  const getIcon = (window as any).getIcon;

  const actions: LegacyContextMenuAction[] = [
    {
      key: "reply",
      label: t("actions.reply"),
      iconHtml: typeof getIcon === "function" ? getIcon("reply", "", 'aria-hidden="true"') : "",
      danger: false
    }
  ];

  if (message.body) {
    actions.push({
      key: "copy_text",
      label: t("actions.copyText"),
      iconHtml: typeof getIcon === "function" ? getIcon("copy", "", 'aria-hidden="true"') : "",
      danger: false
    });
  } else {
    actions.push({
      key: "copy_link",
      label: t("actions.copyLink"),
      iconHtml: typeof getIcon === "function" ? getIcon("copy", "", 'aria-hidden="true"') : "",
      danger: false
    });
  }

  if (isLegacyMessageDownloadable(message)) {
    actions.push({
      key: "download",
      label: t("actions.saveFile"),
      iconHtml: typeof getIcon === "function" ? getIcon("download", "", 'aria-hidden="true"') : "",
      danger: false
    });
  }

  actions.push({
    key: "delete",
    label: t("actions.delete"),
    iconHtml: typeof getIcon === "function" ? getIcon("trash-2", "", 'aria-hidden="true"') : "",
    danger: true
  });

  return actions;
}

export function getLegacyMessageLinkOrText(message: any): string {
  if (message.body) {
    const match = message.body.match(/https?:\/\/[^\s]+/i);
    if (match) {
      return match[0];
    }
    return message.body;
  }
  if (message.attachmentPath) {
    const apiBase = (window as any).apiBase || "/api";
    return window.location.origin + apiBase + "/v1/messages/" + encodeURIComponent(message.id) + "/media";
  }
  return "";
}
