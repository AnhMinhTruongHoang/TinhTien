import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Owner } from '../owners/schemas/owner.schemas';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { Debt, DebtDocument, DebtType } from './schema/debt.schema';
import {
  DebtDeleteResponse,
  DebtGroupedAggregation,
  DebtListResponse,
  DebtOwnerResponse,
  DebtRecord,
  DebtResponse,
  DebtSummaryOwner,
  DebtSummaryResponse,
  DebtTotals,
  DebtTotalsAggregation,
  DebtUpdateResponse,
  OwnerRecord,
  OwnerResponse,
} from 'src/type/debts.types';

@Injectable()
export class DebtsService {
  constructor(
    @InjectModel(Debt.name)
    private readonly debtModel: Model<DebtDocument>,

    @InjectModel(Owner.name)
    private readonly ownerModel: Model<Owner>,
  ) {}

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }

    return new Types.ObjectId(id);
  }

  private async ensureOwnerExists(ownerId: string): Promise<OwnerResponse> {
    const objectId = this.toObjectId(ownerId);

    const owner = (await this.ownerModel
      .findById(objectId)
      .select('_id name contact address')
      .lean()
      .exec()) as OwnerRecord | null;

    if (!owner) {
      throw new NotFoundException(
        `Không tìm thấy chủ động vật với ID ${ownerId}`,
      );
    }

    return {
      _id: owner._id.toString(),
      name: owner.name,
      contact: owner.contact || undefined,
      address: owner.address || undefined,
    };
  }

  private async getOwnerMap(
    ownerIds: Types.ObjectId[],
  ): Promise<Map<string, OwnerResponse>> {
    if (ownerIds.length === 0) {
      return new Map();
    }

    const uniqueIds = Array.from(
      new Map(ownerIds.map((id) => [id.toString(), id])).values(),
    );

    const owners = (await this.ownerModel
      .find({ _id: { $in: uniqueIds } })
      .select('_id name contact address')
      .lean()
      .exec()) as OwnerRecord[];

    return new Map(
      owners.map((owner) => [
        owner._id.toString(),
        {
          _id: owner._id.toString(),
          name: owner.name,
          contact: owner.contact || undefined,
          address: owner.address || undefined,
        },
      ]),
    );
  }

  private async getTotals(
    ownerId: string,
    excludeId?: string,
  ): Promise<DebtTotals> {
    const match: {
      owner: Types.ObjectId;
      _id?: { $ne: Types.ObjectId };
    } = {
      owner: this.toObjectId(ownerId),
    };

    if (excludeId) {
      match._id = { $ne: this.toObjectId(excludeId) };
    }

    const result = await this.debtModel
      .aggregate<DebtTotalsAggregation>([
        { $match: match },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    let totalDebt = 0;
    let totalPayment = 0;

    for (const row of result) {
      if (row._id === DebtType.DEBT) {
        totalDebt = Number(row.total || 0);
      }

      if (row._id === DebtType.PAYMENT) {
        totalPayment = Number(row.total || 0);
      }
    }

    return {
      totalDebt,
      totalPayment,
      balance: Math.max(totalDebt - totalPayment, 0),
    };
  }

  private validateBalance(totalDebt: number, totalPayment: number): number {
    const balance = totalDebt - totalPayment;

    if (balance < 0) {
      throw new BadRequestException(
        'Số tiền thu nợ không được lớn hơn công nợ hiện tại',
      );
    }

    return balance;
  }

  async create(dto: CreateDebtDto): Promise<DebtResponse> {
    await this.ensureOwnerExists(dto.ownerId);

    const currentTotals = await this.getTotals(dto.ownerId);

    const totalDebt =
      currentTotals.totalDebt +
      (dto.type === DebtType.DEBT ? Number(dto.amount) : 0);

    const totalPayment =
      currentTotals.totalPayment +
      (dto.type === DebtType.PAYMENT ? Number(dto.amount) : 0);

    const balance = this.validateBalance(totalDebt, totalPayment);

    const debt = new this.debtModel({
      owner: this.toObjectId(dto.ownerId),
      type: dto.type,
      amount: Number(dto.amount),
      date: new Date(dto.date),
      note: dto.note?.trim() || '',
    });

    const savedDebt = await debt.save();
    const savedDebtData = savedDebt.toObject() as DebtRecord;

    return {
      _id: savedDebtData._id.toString(),
      owner: savedDebtData.owner.toString(),
      type: savedDebtData.type,
      amount: Number(savedDebtData.amount),
      date: savedDebtData.date,
      note: savedDebtData.note || '',
      balance,
      createdAt: savedDebtData.createdAt,
      updatedAt: savedDebtData.updatedAt,
    };
  }

  async findAll(): Promise<DebtListResponse[]> {
    const debts = (await this.debtModel
      .find()
      .select('_id owner type amount date note createdAt updatedAt')
      .sort({ date: -1, createdAt: -1 })
      .lean()
      .exec()) as DebtRecord[];

    if (debts.length === 0) {
      return [];
    }

    const ownerMap = await this.getOwnerMap(debts.map((item) => item.owner));

    return debts.map((item) => ({
      _id: item._id.toString(),
      owner: ownerMap.get(item.owner.toString()) ?? {
        _id: item.owner.toString(),
        name: '',
      },
      type: item.type,
      amount: Number(item.amount),
      date: item.date,
      note: item.note || '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async findById(id: string): Promise<DebtListResponse> {
    const objectId = this.toObjectId(id);

    const debt = (await this.debtModel
      .findById(objectId)
      .select('_id owner type amount date note createdAt updatedAt')
      .lean()
      .exec()) as DebtRecord | null;

    if (!debt) {
      throw new NotFoundException(`Không tìm thấy giao dịch công nợ ${id}`);
    }

    const owner = await this.ensureOwnerExists(debt.owner.toString());

    return {
      _id: debt._id.toString(),
      owner,
      type: debt.type,
      amount: Number(debt.amount),
      date: debt.date,
      note: debt.note || '',
      createdAt: debt.createdAt,
      updatedAt: debt.updatedAt,
    };
  }

  async findByOwner(ownerId: string): Promise<DebtOwnerResponse> {
    const owner = await this.ensureOwnerExists(ownerId);

    const transactions = (await this.debtModel
      .find({ owner: this.toObjectId(ownerId) })
      .select('_id owner type amount date note createdAt updatedAt')
      .sort({ date: -1, createdAt: -1 })
      .lean()
      .exec()) as DebtRecord[];

    const totals = await this.getTotals(ownerId);

    return {
      owner,
      totalDebt: totals.totalDebt,
      totalPayment: totals.totalPayment,
      balance: this.validateBalance(totals.totalDebt, totals.totalPayment),
      transactions: transactions.map((item) => ({
        _id: item._id.toString(),
        owner: item.owner.toString(),
        type: item.type,
        amount: Number(item.amount),
        date: item.date,
        note: item.note || '',
        balance: 0,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }

  async getSummary(): Promise<DebtSummaryResponse> {
    const grouped = await this.debtModel
      .aggregate<DebtGroupedAggregation>([
        {
          $group: {
            _id: { owner: '$owner', type: '$type' },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    const ownerTotals = new Map<
      string,
      { totalDebt: number; totalPayment: number; transactionCount: number }
    >();

    for (const row of grouped) {
      const ownerId = row._id.owner.toString();

      if (!ownerTotals.has(ownerId)) {
        ownerTotals.set(ownerId, {
          totalDebt: 0,
          totalPayment: 0,
          transactionCount: 0,
        });
      }

      const item = ownerTotals.get(ownerId)!;

      if (row._id.type === DebtType.DEBT) {
        item.totalDebt += Number(row.total || 0);
      }

      if (row._id.type === DebtType.PAYMENT) {
        item.totalPayment += Number(row.total || 0);
      }

      item.transactionCount += Number(row.count || 0);
    }

    const ownerIds = Array.from(ownerTotals.keys()).map((id) =>
      this.toObjectId(id),
    );
    const ownerMap = await this.getOwnerMap(ownerIds);

    const ownerSummaries: DebtSummaryOwner[] = Array.from(ownerTotals.entries())
      .map(([ownerId, totals]) => {
        const owner = ownerMap.get(ownerId);

        if (!owner) {
          return null;
        }

        const balance = totals.totalDebt - totals.totalPayment;

        return {
          owner,
          totalDebt: totals.totalDebt,
          totalPayment: totals.totalPayment,
          balance,
          transactionCount: totals.transactionCount,
        };
      })
      .filter((item): item is DebtSummaryOwner => item !== null)
      .sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0));

    const totalDebt = ownerSummaries.reduce(
      (sum, item) => sum + Number(item.totalDebt || 0),
      0,
    );

    const totalPayment = ownerSummaries.reduce(
      (sum, item) => sum + Number(item.totalPayment || 0),
      0,
    );

    return {
      totalDebt,
      totalPayment,
      totalBalance: totalDebt - totalPayment,
      totalOwners: ownerSummaries.length,
      owners: ownerSummaries,
    };
  }

  async update(id: string, dto: UpdateDebtDto): Promise<DebtUpdateResponse> {
    const objectId = this.toObjectId(id);

    const existing = (await this.debtModel
      .findById(objectId)
      .select('_id owner type amount date note createdAt updatedAt')
      .lean()
      .exec()) as DebtRecord | null;

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy giao dịch công nợ ${id}`);
    }

    const oldOwnerId = existing.owner.toString();
    const newOwnerId = dto.ownerId ?? oldOwnerId;
    const newType = dto.type ?? existing.type;
    const newAmount =
      dto.amount !== undefined ? Number(dto.amount) : Number(existing.amount);
    const newDate = dto.date !== undefined ? new Date(dto.date) : existing.date;
    const newNote =
      dto.note !== undefined ? dto.note.trim() : existing.note || '';

    if (newOwnerId !== oldOwnerId) {
      const oldOwnerTotals = await this.getTotals(oldOwnerId, id);
      this.validateBalance(
        oldOwnerTotals.totalDebt,
        oldOwnerTotals.totalPayment,
      );
    }

    const baseTotals = await this.getTotals(
      newOwnerId,
      newOwnerId === oldOwnerId ? id : undefined,
    );

    const totalDebt =
      baseTotals.totalDebt + (newType === DebtType.DEBT ? newAmount : 0);

    const totalPayment =
      baseTotals.totalPayment + (newType === DebtType.PAYMENT ? newAmount : 0);

    const balance = this.validateBalance(totalDebt, totalPayment);

    const updated = (await this.debtModel
      .findByIdAndUpdate(
        objectId,
        {
          owner: this.toObjectId(newOwnerId),
          type: newType,
          amount: newAmount,
          date: newDate,
          note: newNote,
        },
        { new: true, runValidators: true },
      )
      .select('_id owner type amount date note createdAt updatedAt')
      .lean()
      .exec()) as DebtRecord | null;

    if (!updated) {
      throw new NotFoundException(`Không tìm thấy giao dịch công nợ ${id}`);
    }

    const owner = await this.ensureOwnerExists(updated.owner.toString());

    return {
      _id: updated._id.toString(),
      owner,
      type: updated.type,
      amount: Number(updated.amount),
      date: updated.date,
      note: updated.note || '',
      balance,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(id: string): Promise<DebtDeleteResponse> {
    const objectId = this.toObjectId(id);

    const existing = (await this.debtModel
      .findById(objectId)
      .select('_id owner type amount date note createdAt updatedAt')
      .lean()
      .exec()) as DebtRecord | null;

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy giao dịch công nợ ${id}`);
    }

    const totalsAfterDelete = await this.getTotals(
      existing.owner.toString(),
      id,
    );

    this.validateBalance(
      totalsAfterDelete.totalDebt,
      totalsAfterDelete.totalPayment,
    );

    await this.debtModel.findByIdAndDelete(objectId).exec();

    return {
      message: 'Xóa giao dịch công nợ thành công',
      deletedId: id,
      deletedType: existing.type,
      deletedAmount: Number(existing.amount),
    };
  }
}
