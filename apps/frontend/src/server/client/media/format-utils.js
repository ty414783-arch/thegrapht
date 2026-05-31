export const formatUtils = () => `
      const getLocalMessagesForDialog = (dialogPublicId) => localOutgoingMessages.filter((message) => message.dialogPublicId === dialogPublicId);

      const releaseLocalMessageMediaUrls = () => {
        for (const message of localOutgoingMessages) {
          if (message?.mediaUrl && String(message.mediaUrl).startsWith("blob:")) {
            URL.revokeObjectURL(message.mediaUrl);
          }
        }
      };

      const formatBytes = (bytes) => {
        if (!Number.isFinite(bytes) || bytes <= 0) {
          return "";
        }

        if (bytes >= 1024 * 1024) {
          return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "") + " MB";
        }

        return Math.max(1, Math.round(bytes / 1024)) + " KB";
      };

      const formatPhotoCount = (count) => count === 1 ? "Send Photo" : ("Send " + count + " Photos");
      const formatFileCount = (count) => count === 1 ? "Send File" : ("Send " + count + " Files");
      const formatDuration = (seconds) => {
        if (!Number.isFinite(seconds) || seconds <= 0) {
          return "";
        }
        const total = Math.round(seconds);
        const minutes = Math.floor(total / 60);
        const remSeconds = total % 60;
        return minutes + ":" + String(remSeconds).padStart(2, "0");
      };
      const measureAudioDuration = (src) => new Promise((resolve) => {
        if (!src) {
          resolve(0);
          return;
        }
        const audio = document.createElement("audio");
        let settled = false;
        const finish = (value) => {
          if (settled) {
            return;
          }
          settled = true;
          audio.removeAttribute("src");
          audio.load();
          resolve(Number.isFinite(value) ? value : 0);
        };
        audio.preload = "metadata";
        audio.onloadedmetadata = () => {
          finish(audio.duration);
        };
        audio.onerror = () => finish(0);
        audio.src = src;
      });

      const chunkItems = (items, size) => {
        const result = [];

        for (let index = 0; index < items.length; index += size) {
          result.push(items.slice(index, index + size));
        }

        return result;
      };
      const toEpochMs = (value) => {
        if (value === null || value === undefined || value === "") {
          return 0;
        }

        if (typeof value === "number" && Number.isFinite(value)) {
          return value > 1000000000000 ? Math.floor(value) : Math.floor(value * 1000);
        }

        const raw = String(value).trim();
        if (!raw) {
          return 0;
        }

        if (/^\d+$/.test(raw)) {
          const numeric = Number(raw);
          if (!Number.isFinite(numeric) || numeric <= 0) {
            return 0;
          }
          return numeric > 1000000000000 ? Math.floor(numeric) : Math.floor(numeric * 1000);
        }

        const parsed = Date.parse(raw);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          return 0;
        }

        return Math.floor(parsed);
      };
      const startOfDayTs = (value) => {
        const date = new Date(toEpochMs(value));
        if (Number.isNaN(date.getTime())) {
          return 0;
        }
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      };
      const formatDaySeparatorLabel = (value) => {
        const date = new Date(toEpochMs(value));
        if (Number.isNaN(date.getTime())) {
          return "";
        }
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const diffDays = Math.round((today - target) / 86400000);
        if (diffDays === 0) {
          return "Today";
        }
        if (diffDays === 1) {
          return "Yesterday";
        }
        if (diffDays >= 2 && diffDays <= 5) {
          return date.toLocaleDateString("en-US", { weekday: "long" });
        }
        return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
      };

`;
