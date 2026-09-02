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

// ============ CALCULATION HISTORY API ============
export const calculationHistoryApi = {
  create: (data: {
    batchId: string;
    pricePerUnit: number;
    slaughterPricePerUnit?: number;
    transportCost?: number;
  }) =>
    request<any>("/calculation-history", {
      method: "POST",
      body: data,
    }),

  getAll: () => request<any[]>("/calculation-history"),

  getByBatch: (batchId: string) =>
    request<any[]>(`/calculation-history/batch/${batchId}`),

  getById: (id: string) => request<any>(`/calculation-history/${id}`),

  delete: (id: string) =>
    request<any>(`/calculation-history/${id}`, {
      method: "DELETE",
    }),
};

// Cập nhật object api
export const api = {
  batches: batchesApi,
  owners: ownersApi,
  animalTypes: animalTypesApi,
  calculationHistory: calculationHistoryApi,
};
