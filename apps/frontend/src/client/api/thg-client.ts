import type { Dialog, Message, User } from "../store/types.ts";

export type ClientStateResponse = {
  user?: User | null;
  dialogs?: Dialog[];
  selectedDialog?: Dialog | null;
  messages?: Message[];
};

export type FetchJsonFn = <T = unknown>(url: string, options?: RequestInit) => Promise<T>;

const getApiBase = (): string => {
  const win = window as any;
  return String(win.apiBase || win.__THEGRAPHT_CONFIG__?.apiBaseUrl || "/api").replace(/\/+$/, "");
};

export const thgApi = {
  getApiBase,
  async fetchJson<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    const win = window as any;
    const fetchImpl = typeof win.fetchJson === "function" ? win.fetchJson : fetch;
    const absoluteUrl = url.startsWith("http") ? url : `${getApiBase()}${url.startsWith("/") ? url : `/${url}`}`;
    return fetchImpl(absoluteUrl, {
      credentials: "include",
      ...options
    }) as Promise<T>;
  },
  getClientState(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : "";
    return this.fetchJson<ClientStateResponse>(`/v1/client-state${suffix}`);
  },
  markDialogRead(publicId: string) {
    return this.fetchJson(`/v1/dialogs/by-public-id/${encodeURIComponent(publicId)}/read`, {
      method: "POST"
    });
  },
  sendTextMessage(publicId: string, body: string, replyToMessageId?: string | null) {
    return this.fetchJson(`/v1/dialogs/by-public-id/${encodeURIComponent(publicId)}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "send_" + crypto.randomUUID()
      },
      body: JSON.stringify({
        body,
        replyToMessageId: replyToMessageId || undefined
      })
    });
  },
  getMessages(publicId: string, params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : "";
    return this.fetchJson<{ messages?: Message[] }>(
      `/v1/dialogs/by-public-id/${encodeURIComponent(publicId)}/messages${suffix}`
    );
  }
};

export type { Dialog, Message, User };
