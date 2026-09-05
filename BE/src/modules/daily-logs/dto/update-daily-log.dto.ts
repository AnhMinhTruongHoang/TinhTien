import { PartialType } from '@nestjs/mapped-types';

import { CreateDailyLogDto } from './create-daily-log.dto';

export class UpdateDailyLogDto extends PartialType(CreateDailyLogDto) {}
