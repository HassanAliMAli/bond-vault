type RequestConfig = {
  method?: "GET" | "POST" | "DELETE" | "PATCH";
  body?: unknown;
  params?: Record<string, string | undefined>;
};

async function apiFetch<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { method = "GET", body, params } = config;

  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, value);
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export interface Bond {
  id: string;
  user_id: string;
  denomination: string;
  bond_number: string;
  created_at: string;
}

export interface BondListResponse {
  bonds: Bond[];
  total: number;
}

export interface DashboardData {
  totalBonds: number;
  totalChecked: number;
  totalMatches: number;
  denominations: { denomination: string; count: number }[];
  winners: {
    id: string;
    bondNumber: string;
    denomination: string;
    prizeType: string;
    prizeAmount: string;
    drawDate: string;
  }[];
}

export interface CheckResponse {
  matches: {
    id: string;
    bondNumber: string;
    denomination: string;
    prizeType: string;
    prizeAmount: string;
    drawDate: string;
    drawNumber: string;
  }[];
  totalChecked: number;
}

export const api = {
  bonds: {
    list: (params?: {
      denomination?: string;
      search?: string;
      sort?: string;
    }) => apiFetch<BondListResponse>("/api/bonds", { params }),

    create: (data: { denomination: string; bond_number: string }) =>
      apiFetch<Bond>("/api/bonds", { method: "POST", body: data }),

    delete: (id: string) =>
      apiFetch<{ success: true }>(`/api/bonds/${id}`, { method: "DELETE" }),
  },

  dashboard: {
    get: () => apiFetch<DashboardData>("/api/dashboard"),
  },

  check: {
    run: () => apiFetch<CheckResponse>("/api/check", { method: "POST" }),
  },
};
