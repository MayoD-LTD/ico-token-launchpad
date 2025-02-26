import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export interface GlobalPool {
  admin: PublicKey;
  totalIcoCount: anchor.BN;
  icoSeqNum: anchor.BN;
  isPaused: number;
}

export interface IcoState {
  seed: anchor.BN;
  owner: PublicKey;

  icoMint: PublicKey;
  icoDecimals: anchor.BN;
  amount: anchor.BN;

  costMint: PublicKey;
  startPrice: anchor.BN;
  endPrice: anchor.BN;
  startDate: anchor.BN;
  endDate: anchor.BN;

  bonusReserve: anchor.BN;
  bonusPercentage: number;
  bonusActivator: number;

  isClosed: number;

  totalSold: anchor.BN;
  totalReceived: anchor.BN;

  unlockPercentage: number;
  cliffPeriod: anchor.BN;
  vestingPercentage: number;
  vestingInterval: anchor.BN;

  purchaseSeqNum: anchor.BN;

  // extra: anchor.BN; // u128
}

export const ICO_STATE_SIZE =
  8 + 8 + 32 + 32 + 8 + 8 + 32 + 8 * 5 + 8 + 8 + 8 + 2 + 8 + 2 + 8 + 8 + 16 + 4;

export interface UserPurchase {
  seed: anchor.BN;
  buyer: PublicKey;
  ico: PublicKey;
  buyAmount: anchor.BN;
  buyDate: anchor.BN;
  bonus: anchor.BN;
  lockedAmount: anchor.BN;
  totalClaimed: anchor.BN;
}

export const USER_PURCHASE_SIZE = 8 + 8 + 32 + 32 + 8 * 5 + 16;

export interface CreateIcoParams {
  amount: anchor.BN;
  startPrice: anchor.BN;
  endPrice: anchor.BN;
  startDate: anchor.BN;
  endDate: anchor.BN;

  bonusReserve: anchor.BN;
  bonusPercentage: number;
  bonusActivator: number;

  unlockPercentage: number;
  cliffPeriod: anchor.BN;
  vestingPercentage: number;
  vestingInterval: anchor.BN;
}

export interface CreateIcoInputs {
  amount: string;
  startPrice: string;
  endPrice: string;
  startDate: number;
  endDate: number;

  bonusReserve: string;
  bonusPercentage: number;
  bonusActivator: number;

  unlockPercentage: number;
  cliffPeriod: number;
  vestingPercentage: number;
  vestingInterval: number;
}
