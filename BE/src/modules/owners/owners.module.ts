import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Owner, OwnerSchema } from './schemas/owner.schemas';
import { OwnersController } from './owners.controller';
import { OwnerService } from './owners.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Owner.name, schema: OwnerSchema }]),
  ],
  controllers: [OwnersController],
  providers: [OwnerService],
  exports: [OwnerService],
})
export class OwnerModule implements OnModuleInit {
  constructor(private ownerService: OwnerService) {}

  async onModuleInit() {
    await this.ownerService.seedDefaultOwners();
  }
}
