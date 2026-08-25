import { t } from "../../i18n";

export type LegacyDialogContextMenuAction = {
  key: string;
  label: string;
  iconHtml: string;
};

export function getLegacyDialogContextMenuActions(archived: boolean): LegacyDialogContextMenuAction[] {
  const getIcon = (window as any).getIcon;
  const archiveLabel = archived ? t("sidebar.unarchive") : t("sidebar.archiveChat");

  return [
    {
      key: "archive",
      label: archiveLabel,
      iconHtml: typeof getIcon === "function" ? getIcon("archive", "", 'aria-hidden="true"') : ""
    },
    {
      key: "open_in_new",
      label: "Open chat in new window",
      iconHtml: typeof getIcon === "function" ? getIcon("open_in_new", "", 'aria-hidden="true"') : ""
    }
  ];
}
