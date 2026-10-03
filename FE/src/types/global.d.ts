// ============ OWNERS ============
declare namespace Owners {
  interface Owner {
    _id: string;
    name: string;
    contact?: string;
    address?: string;
  }

  interface CreateOwnerDto {
    name: string;
    contact?: string;
    address?: string;
  }

  interface UpdateOwnerDto {
    name?: string;
    contact?: string;
    address?: string;
  }
}

// ============ ANIMAL TYPES ============
declare namespace AnimalTypes {
  interface AnimalType {
    _id: string;
    name: string;
    unit?: string;
    description?: string;
  }

  interface CreateAnimalTypeDto {
    name: string;
    unit?: string;
    description?: string;
  }

  interface UpdateAnimalTypeDto {
    name?: string;
    unit?: string;
    description?: string;
  }
}

// ============ BATCHES ============
declare namespace Batches {
  interface DailySlaughter {
    day: number;
    quantity: number;
  }

  interface Batch {
    _id: string;
    owner: Owners.Owner | string;
    animalType: AnimalTypes.AnimalType | string;
    month: string; // "YYYY-MM"
    dailySlaughters: DailySlaughter[];
    totalQuantity: number;
    originAddress?: string;
    destinationAddress?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface CreateBatchDto {
    ownerId: string;
    animalTypeId: string;
    month: string;
    dailySlaughters: DailySlaughter[];
    originAddress?: string;
    destinationAddress?: string;
    notes?: string;
  }

  interface UpdateBatchDto {
    ownerId?: string;
    animalTypeId?: string;
    month?: string;
    dailySlaughters?: DailySlaughter[];
    originAddress?: string;
    destinationAddress?: string;
    notes?: string;
  }

  interface CalculateCostDto {
    batchId: string;
    pricePerUnit: number;
  }

  interface CostResult {
    batchId: string;
    month: string;
    totalQuantity: number;
    pricePerUnit: number;
    totalCost: number;
    dailySlaughters: DailySlaughter[];
  }

  interface HistoryItem {
    _id: string;
    batch: string | Batch;
    month: string;
    pricePerUnit: number;
    totalQuantity: number;
    totalCost: number;
    dailySlaughtersSnapshot: DailySlaughter[];
    calculatedAt: string;
  }
}

// ============ API RESPONSE ============
declare namespace ApiResponse {
  interface Success<T> {
    data: T;
    status: "success";
  }

  interface Error {
    message: string;
    status: "error";
  }
}

//////////// api debts types ////////////
declare namespace Debts {
  export type DebtType = "DEBT" | "PAYMENT";

  export interface CreateDebtDto {
    ownerId: string;
    type: DebtType;
    amount: number;
    date: string;
    note?: string;
  }

  export interface UpdateDebtDto {
    ownerId?: string;
    type?: DebtType;
    amount?: number;
    date?: string;
    note?: string;
  }

  export interface OwnerResponse {
    _id: string;
    name: string;
    contact?: string;
    address?: string;
  }

  export interface DebtResponse {
    _id: string;
    owner: string;
    type: DebtType;
    amount: number;
    date: string;
    note: string;
    balance: number;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface DebtListResponse {
    _id: string;
    owner: OwnerResponse;
    type: DebtType;
    amount: number;
    date: string;
    note: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface DebtUpdateResponse extends DebtListResponse {
    balance: number;
  }

  export interface DebtTransaction {
    _id: string;
    owner: string | OwnerResponse;
    type: DebtType;
    amount: number;
    date: string;
    note: string;
    balance: number;
    balanceAfter?: number;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface OwnerHistory {
    owner: OwnerResponse;
    totalDebt: number;
    totalPayment: number;
    balance: number;
    transactions: DebtTransaction[];
  }

  interface OwnerSummary {
    owner: OwnerResponse;
    totalDebt: number;
    totalPayment: number;
    balance: number;
    transactionCount: number;
  }

  interface Summary {
    totalDebt: number;
    totalPayment: number;
    totalBalance: number;
    totalOwners: number;
    owners: OwnerSummary[];
  }

  export interface DeleteResponse {
    message: string;
    deletedId: string;
    deletedType: DebtType;
    deletedAmount: number;
  }
}
