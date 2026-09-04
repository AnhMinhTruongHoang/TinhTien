const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", headers = {}, body } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ============ BATCHES API ============
export const batchesApi = {
  create: (data: any) =>
    request<Batches.Batch>("/batches", { method: "POST", body: data }),
  getAll: () => request<Batches.Batch[]>("/batches"),
  getById: (id: string) => request<Batches.Batch>(`/batches/${id}`),
  update: (id: string, data: any) =>
    request<Batches.Batch>(`/batches/${id}`, { method: "PUT", body: data }),
  delete: (id: string) =>
    request<Batches.Batch>(`/batches/${id}`, { method: "DELETE" }),
  calculateCost: (data: any) =>
    request<Batches.CostResult>("/batches/calculate-cost", {
      method: "POST",
      body: data,
    }),
  getByOwner: (ownerId: string) =>
    request<Batches.Batch[]>(`/batches/owner/${ownerId}`),
  getByAnimalType: (animalTypeId: string) =>
    request<Batches.Batch[]>(`/batches/animal-type/${animalTypeId}`),
};

// ============ OWNERS API ============
export const ownersApi = {
  create: (data: any) =>
    request<Owners.Owner>("/owners", { method: "POST", body: data }),
  getAll: () => request<Owners.Owner[]>("/owners"),
  getById: (id: string) => request<Owners.Owner>(`/owners/${id}`),
  update: (id: string, data: any) =>
    request<Owners.Owner>(`/owners/${id}`, { method: "PUT", body: data }),
  delete: (id: string) =>
    request<Owners.Owner>(`/owners/${id}`, { method: "DELETE" }),
};

// ============ ANIMAL TYPES API ============
export const animalTypesApi = {
  create: (data: any) =>
    request<AnimalTypes.AnimalType>("/animal-types", {
      method: "POST",
      body: data,
    }),
  getAll: () => request<AnimalTypes.AnimalType[]>("/animal-types"),
  getById: (id: string) =>
    request<AnimalTypes.AnimalType>(`/animal-types/${id}`),
  update: (id: string, data: any) =>
    request<AnimalTypes.AnimalType>(`/animal-types/${id}`, {
      method: "PUT",
      body: data,
    }),
  delete: (id: string) =>
    request<AnimalTypes.AnimalType>(`/animal-types/${id}`, {
      method: "DELETE",
    }),
};

// ============ DAILY LOGS API ============
export const dailyLogsApi = {
  create: (data: {
    ownerId: string;
    animalTypeId: string;
    date: string;
    quantity: number;
    notes?: string;
  }) =>
    request<any>("/daily-logs", {
      method: "POST",
      body: data,
    }),

  getAll: () => request<any[]>("/daily-logs"),

  getById: (id: string) => request<any>(`/daily-logs/${id}`),

  update: (
    id: string,
    data: {
      ownerId?: string;
      animalTypeId?: string;
      date?: string;
      quantity?: number;
      notes?: string;
    }
  ) =>
    request<any>(`/daily-logs/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: string) =>
    request<any>(`/daily-logs/${id}`, {
      method: "DELETE",
    }),

  monthSummary: (ownerId: string, animalTypeId: string, month: string) =>
    request<any>(
      `/daily-logs/month-summary?ownerId=${encodeURIComponent(
        ownerId
      )}&animalTypeId=${encodeURIComponent(
        animalTypeId
      )}&month=${encodeURIComponent(month)}`
    ),
};

// ============ CALCULATION HISTORY API ============
export const calculationHistoryApi = {
  create: (data: { dailyLogId: string; pricePerUnit: number }) =>
    request<any>("/calculation-history", {
      method: "POST",
      body: data,
    }),

  getAll: () => request<any[]>("/calculation-history"),

  getByDailyLog: (dailyLogId: string) =>
    request<any[]>(`/calculation-history/daily/${dailyLogId}`),

  getById: (id: string) => request<any>(`/calculation-history/${id}`),

  markAsPaid: (id: string) =>
    request<any>(`/calculation-history/${id}/paid`, {
      method: "PUT",
    }),

  delete: (id: string) =>
    request<any>(`/calculation-history/${id}`, {
      method: "DELETE",
    }),

  markMonthAsPaid: (data: {
    ownerId: string;
    animalTypeId: string;
    month: string;
  }) =>
    request<any>("/calculation-history/month/paid", {
      method: "PUT",
      body: data,
    }),
};

export const backupApi = {
  getAll: () => request<any[]>("/backup"),

  create: () =>
    request<any>("/backup", {
      method: "POST",
    }),

  delete: (filename: string) =>
    request<any>(`/backup/${encodeURIComponent(filename)}`, {
      method: "DELETE",
    }),

  getDownloadUrl: (filename: string) =>
    `${API_BASE_URL}/backup/${encodeURIComponent(filename)}/download`,

  restoreTest: (filename: string) =>
    request<any>(`/backup/${encodeURIComponent(filename)}/restore-test`, {
      method: "POST",
    }),

  restore: (filename: string, confirmation: string) =>
    request<any>(`/backup/${encodeURIComponent(filename)}/restore`, {
      method: "POST",

      body: {
        confirmation,
      },
    }),
};
// Cập nhật object api
export const api = {
  dailyLogs: dailyLogsApi,
  owners: ownersApi,
  animalTypes: animalTypesApi,
  calculationHistory: calculationHistoryApi,
  backup: backupApi,
};
