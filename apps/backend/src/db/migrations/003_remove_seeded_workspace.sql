DELETE FROM dialogs
WHERE id IN ('dlg_core', 'dlg_news', 'dlg_secret')
   OR id LIKE 'dlg_welcome_%';
