import { Types } from 'mongoose';
import { DebtType } from 'src/modules/debts/schema/debt.schema';

export interface OwnerRecord {
  _id: Types.ObjectId;
  name: string;
  contact?: string | null;
  address?: string | null;
}

export interface OwnerResponse {
  _id: string;
  name: string;
  contact?: string;
  address?: string;
}

export interface DebtRecord {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  type: DebtType;
  amount: number;
  date: Date;
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DebtResponse {
  _id: string;
  owner: string;
  type: string;
  amount: number;
  date: Date;
  note: string;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DebtListResponse {
  _id: string;
  owner: OwnerResponse;
  type: string;
  amount: number;
  date: Date;
  note: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DebtUpdateResponse extends DebtListResponse {
  balance: number;
}

export interface DebtOwnerResponse {
  owner: OwnerResponse;
  totalDebt: number;
  totalPayment: number;
  balance: number;
  transactions: DebtResponse[];
}

export interface DebtSummaryOwner {
  owner: OwnerResponse;
  totalDebt: number;
  totalPayment: number;
  balance: number;
  transactionCount: number;
}

export interface DebtSummaryResponse {
  totalDebt: number;
  totalPayment: number;
  totalBalance: number;
  totalOwners: number;
  owners: DebtSummaryOwner[];
}

export interface DebtDeleteResponse {
  message: string;
  deletedId: string;
  deletedType: string;
  deletedAmount: number;
}

export interface DebtTotals {
  totalDebt: number;
  totalPayment: number;
  balance: number;
}

export interface DebtTotalsAggregation {
  _id: DebtType;
  total: number;
}

export interface DebtGroupedAggregation {
  _id: {
    owner: Types.ObjectId;
    type: DebtType;
  };
  total: number;
  count: number;
}
