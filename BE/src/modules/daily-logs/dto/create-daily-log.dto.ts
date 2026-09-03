// create-daily-log.dto.ts
export class CreateDailyLogDto {
  ownerId: string;
  animalTypeId: string;
  date: string; // "YYYY-MM-DD"
  quantity: number;
  notes?: string;
}
