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
  interface Batch {
    _id: string;
    owner: Owners.Owner | string;
    animalType: AnimalTypes.AnimalType | string;
    originAddress?: string;
    destinationAddress?: string;
    quantity: number;
    quantityNotSlaughtered: number;
    recordDate: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  interface CreateBatchDto {
    ownerId: string;
    animalTypeId: string;
    originAddress?: string;
    destinationAddress?: string;
    quantity: number;
    quantityNotSlaughtered?: number;
    recordDate?: string;
    notes?: string;
  }

  interface UpdateBatchDto {
    owner?: string;
    animalType?: string;
    originAddress?: string;
    destinationAddress?: string;
    quantity?: number;
    quantityNotSlaughtered?: number;
    recordDate?: Date;
    notes?: string;
  }

  interface CalculateCostDto {
    batchId: string;
    pricePerUnit: number;
    slaughterPricePerUnit?: number;
    transportCost?: number;
  }

  interface CostResult {
    batchId: string;
    quantity: number;
    quantityNotSlaughtered: number;
    slaughterQuantity: number;
    animalCost: number;
    slaughterCost: number;
    transportCost: number;
    totalCost: number;
    costPerUnit: number;
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
