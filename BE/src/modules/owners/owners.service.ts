import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { Owner } from './schemas/owner.schemas';

@Injectable()
export class OwnerService {
  constructor(@InjectModel(Owner.name) private ownerModel: Model<Owner>) {}

  async seedDefaultOwners() {
    const count = await this.ownerModel.countDocuments();
    if (count > 0) {
      console.log('✅ Owners already exist, skipping seed');
      return;
    }

    const defaultOwners = [
      { name: 'Thảo', contact: '', address: '' },
      { name: 'Soi', contact: '', address: '' },
      { name: 'Tuấn', contact: '', address: '' },
      { name: 'Liên', contact: '', address: '' },
      { name: 'Nhật', contact: '', address: '' },
      { name: 'Hoàng', contact: '', address: '' },
      { name: 'Vương', contact: '', address: '' },
      { name: 'Thu', contact: '', address: '' },
      { name: 'Đào', contact: '', address: '' },
      { name: 'Thúy P.C', contact: '', address: '' },
      { name: 'Vương', contact: '', address: '' },
      { name: 'Phương', contact: '', address: '' },
      { name: 'Hân', contact: '', address: '' },
      { name: 'H. Xuân', contact: '', address: '' },
      { name: 'H. Dây', contact: '', address: '' },
      { name: 'Vy', contact: '', address: '' },
      { name: 'Cảnh', contact: '', address: '' },
      { name: 'Tuấn', contact: '', address: '' },
      { name: 'Thầy Lâm', contact: '', address: '' },
      { name: 'Mai', contact: '', address: '' },
      { name: 'H. My', contact: '', address: '' },
      { name: 'Kỳ', contact: '', address: '' },
      { name: 'Anh', contact: '', address: '' },
      { name: 'Vinh', contact: '', address: '' },
      { name: 'Thúy D.', contact: '', address: '' },
      { name: 'Thúy', contact: '', address: '' },
      { name: 'Hoa', contact: '', address: '' },
      { name: 'Hoài', contact: '', address: '' },
      { name: 'Hân', contact: '', address: '' },
      { name: 'Hết', contact: '', address: '' },
      { name: 'Kiên', contact: '', address: '' },
      { name: 'Phúc', contact: '', address: '' },
      { name: 'Nhiêu', contact: '', address: '' },
      { name: 'Bố', contact: '', address: '' },
    ];

    try {
      const created = await this.ownerModel.insertMany(defaultOwners);
      console.log(`✅ Seeded ${created.length} default owners`);
    } catch (error) {
      console.error('❌ Error seeding owners:', error.message);
    }
  }

  create(createOwnerDto: CreateOwnerDto) {
    const owner = new this.ownerModel(createOwnerDto);
    return owner.save();
  }

  findAll() {
    return this.ownerModel.find();
  }

  findById(id: string) {
    return this.ownerModel.findById(id);
  }

  update(id: string, updateOwnerDto: UpdateOwnerDto) {
    return this.ownerModel.findByIdAndUpdate(id, updateOwnerDto, { new: true });
  }

  delete(id: string) {
    return this.ownerModel.findByIdAndDelete(id);
  }
}
