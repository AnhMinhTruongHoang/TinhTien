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
