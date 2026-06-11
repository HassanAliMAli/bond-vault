type ApiResponse<T> = { success: true; data: T; message: null } | { success: false; error: { code: string; message: string } };

type RequestConfig = {
  method?: "GET" | "POST" | "DELETE" | "PATCH";
  body?: unknown;
  params?: Record<string, string | undefined>;
};

async function apiFetch<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { method = "GET", body, params } = config;

  let url = `/api/v1${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, value);
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const isFormData = body instanceof FormData;

  const res = await fetch(url, {
    method,
    headers: !isFormData && body ? { "Content-Type": "application/json" } : undefined,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const msg = (errorBody as any)?.error?.message || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  const json = await res.json() as any;
  if (!json.success) {
    throw new Error(json?.error?.message || "API error");
  }
  return json.data as T;
}

export interface Bond {
  id: string;
  userId: string;
  bondNumber: string;
  denomination: number;
  status: string;
  entryMethod: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface BondListResponse {
  bonds: Bond[];
  total: number;
}

export interface MatchResult {
  id: string;
  userId: string;
  bondId: string;
  winningNumberId: string;
  drawId: string;
  bondNumberSnapshot: string;
  denominationSnapshot: number;
  prizeTypeSnapshot: string;
  prizeAmountSnapshot: number;
  drawDateSnapshot: string;
  status: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  status: string;
}

export interface CheckMatch {
  bondNumber: string;
  prizeType: string;
  prizeAmount: number;
  drawDate: string;
  drawNumber: string;
}

export interface CheckResponse {
  isWinner: boolean;
  matches: CheckMatch[];
}

export interface Draw {
  id: string;
  denomination: number;
  drawNumber: string;
  drawDate: string;
}

export interface ImportPreview {
  importId: string;
  preview: { valid: string[]; invalid: string[]; duplicates: string[] };
  totals: { total: number; valid: number; invalid: number; duplicates: number };
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; fullName?: string }) =>
      apiFetch<{ userId: string; email: string }>("/auth/register", { method: "POST", body: data }),

    login: (data: { email: string; password: string }) =>
      apiFetch<{ userId: string; email: string; token: string }>("/auth/login", { method: "POST", body: data }),

    logout: () =>
      apiFetch<{ message: string }>("/auth/logout", { method: "POST" }),

    me: () =>
      apiFetch<UserProfile>("/auth/me"),
  },

  bonds: {
    list: (params?: { denomination?: string; search?: string; status?: string; page?: number; limit?: number }) =>
      apiFetch<BondListResponse>("/bonds", { params: params as Record<string, string | undefined> }),

    create: (data: { bondNumber: string; denomination: number }) =>
      apiFetch<Bond>("/bonds", { method: "POST", body: data }),

    get: (id: string) =>
      apiFetch<Bond>(`/bonds/${id}`),

    update: (id: string, data: { bondNumber?: string }) =>
      apiFetch<Bond>(`/bonds/${id}`, { method: "PATCH", body: data }),

    delete: (id: string) =>
      apiFetch<{ message: string }>(`/bonds/${id}`, { method: "DELETE" }),

    archive: (id: string) =>
      apiFetch<{ message: string }>(`/bonds/${id}/archive`, { method: "POST" }),

    restore: (id: string) =>
      apiFetch<{ message: string }>(`/bonds/${id}/restore`, { method: "POST" }),
  },

  matches: {
    list: (params?: { status?: string; denomination?: number; page?: number; limit?: number }) =>
      apiFetch<{ matches: MatchResult[]; total: number }>("/matches", { params: params as Record<string, string | undefined> }),

    get: (id: string) =>
      apiFetch<MatchResult>(`/matches/${id}`),

    markViewed: (id: string) =>
      apiFetch<{ message: string }>(`/matches/${id}/view`, { method: "POST" }),
  },

  draws: {
    list: (params?: { denomination?: number; page?: number; limit?: number }) =>
      apiFetch<{ draws: Draw[]; total: number }>("/draws", { params: params as Record<string, string | undefined> }),

    get: (id: string) =>
      apiFetch<Draw>(`/draws/${id}`),

    winners: (id: string) =>
      apiFetch<{ winners: unknown[]; total: number }>(`/draws/${id}/winners`),
  },

  check: {
    run: (data: { bondNumber: string; denomination: number }) =>
      apiFetch<CheckResponse>("/check", { method: "POST", body: data }),
  },

  notifications: {
    list: () =>
      apiFetch<{ notifications: unknown[] }>("/notifications"),

    preferences: {
      get: () =>
        apiFetch<{ emailEnabled: boolean; whatsappEnabled: boolean; smsEnabled: boolean }>("/notifications/preferences"),

      update: (data: { emailEnabled?: boolean; whatsappEnabled?: boolean; smsEnabled?: boolean }) =>
        apiFetch<unknown>("/notifications/preferences", { method: "PATCH", body: data }),
    },
  },

  subscription: {
    current: () =>
      apiFetch<unknown>("/subscription/current"),

    history: () =>
      apiFetch<{ history: unknown[] }>("/subscription/history"),
  },

  plans: {
    list: () =>
      apiFetch<{ plans: unknown[] }>("/plans"),
  },

  payments: {
    create: (data: { planId: string }) =>
      apiFetch<{ paymentId: string; amount: number; status: string }>("/payments", { method: "POST", body: data }),

    list: () =>
      apiFetch<{ payments: unknown[] }>("/payments"),

    get: (id: string) =>
      apiFetch<unknown>(`/payments/${id}`),

    uploadReceipt: (paymentId: string, receipt: File) => {
      const formData = new FormData();
      formData.append("receipt", receipt);
      return apiFetch<{ message: string; paymentId: string }>(`/payments/${paymentId}/receipt`, {
        method: "POST",
        body: formData,
      });
    },
  },

  exports: {
    csv: () => fetch("/api/v1/exports/csv", { credentials: "include" }).then(r => r.blob()),
    xlsx: () => fetch("/api/v1/exports/xlsx", { credentials: "include" }).then(r => r.blob()),
  },

  imports: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch<ImportPreview>("/imports", { method: "POST", body: formData });
    },

    list: () =>
      apiFetch<{ imports: unknown[] }>("/imports"),

    get: (id: string) =>
      apiFetch<unknown>(`/imports/${id}`),

    delete: (id: string) =>
      apiFetch<{ message: string }>(`/imports/${id}`, { method: "DELETE" }),
  },

  ocr: {
    usage: () =>
      apiFetch<{ used: number; remaining: number }>("/ocr/usage"),

    record: (data: { bondNumber: string; denomination: number }) =>
      apiFetch<{ message: string }>("/ocr/usage", { method: "POST", body: data }),
  },

  search: {
    search: (q: string) =>
      apiFetch<{ results: { bonds: Bond[] } }>("/search", { params: { q } }),
  },

  user: {
    profile: () =>
      apiFetch<UserProfile>("/user/profile"),

    updateProfile: (data: { fullName?: string; phone?: string; whatsappNumber?: string }) =>
      apiFetch<UserProfile>("/user/profile", { method: "PATCH", body: data }),

    deleteAccount: () =>
      apiFetch<{ message: string }>("/user/account", { method: "DELETE" }),
  },
};
