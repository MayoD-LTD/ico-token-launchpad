import * as anchor from '@coral-xyz/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';

import { GLOBAL_AUTHORITY_SEED } from './constant';
// import { IcoLaunchpad } from './ico_launchpad';
import { IcoLaunchpad } from '../target/types/ico_launchpad';
import {
  CreateIcoParams,
  ICO_STATE_SIZE,
  IcoState,
  USER_PURCHASE_SIZE,
  UserPurchase,
} from './types';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const createInitializeTx = async (
  admin: PublicKey,
  program: anchor.Program<IcoLaunchpad>
) => {
  const tx = await program.methods
    .initialize()
    .accounts({
      admin,
    })
    .transaction();

  return tx;
};

/**
 * Change admin of the program as old admin
 */
export const changeAdminTx = async (
  admin: PublicKey,
  newAdminAddr: PublicKey,
  program: anchor.Program<IcoLaunchpad>
) => {
  const tx = await program.methods
    .transferAdmin(newAdminAddr)
    .accounts({
      admin,
    })
    .transaction();

  return tx;
};

/**
 * Change global config as admin
 */
export const createChangeConfigTx = async (
  admin: PublicKey,
  paused: boolean,
  program: anchor.Program<IcoLaunchpad>
) => {
  const tx = await program.methods
    .changeConfig(paused ? 1 : 0)
    .accounts({
      admin,
    })
    .transaction();

  return tx;
};

/**
 * Create ICO
 */
export const createIcoTx = async (
  creator: PublicKey,
  icoMint: PublicKey,
  costMint: PublicKey,
  inputParams: CreateIcoParams,
  program: anchor.Program<IcoLaunchpad>,
  icoTokenProgram: PublicKey = TOKEN_PROGRAM_ID,
  costTokenProgram: PublicKey = TOKEN_PROGRAM_ID
) => {
  const tx = new Transaction();

  const txId = await program.methods
    .createIco(inputParams)
    .accounts({
      creator,
      icoMint,
      costMint,
      icoTokenProgram,
      costTokenProgram,
    })
    .transaction();

  tx.add(txId);

  return tx;
};

/**
 * Close ICO with owner authority
 */
export const closeIcoTx = async (
  authority: PublicKey,
  icoPot: PublicKey,
  program: anchor.Program<IcoLaunchpad>,
  tokenProgram: PublicKey = TOKEN_PROGRAM_ID
) => {
  const { data } = await getIcoState(icoPot, program);
  console.log('ico seed', data.seed);

  const tx = await program.methods
    .closeIco(new anchor.BN(data.seed))
    .accounts({
      authority,
      tokenProgram,
    })
    .transaction();

  return tx;
};

export const buyTokenTx = async (
  buyer: PublicKey,
  icoPot: PublicKey,
  amount: string,
  program: anchor.Program<IcoLaunchpad>,
  icoTokenProgram: PublicKey = TOKEN_PROGRAM_ID,
  costTokenProgram: PublicKey = TOKEN_PROGRAM_ID
) => {
  const { data } = await getIcoState(icoPot, program);
  console.log('ico seed', data.seed);

  const tx = new Transaction();
  const txId = await program.methods
    .buyToken(new anchor.BN(data.seed), new anchor.BN(amount))
    .accounts({
      buyer,
      icoTokenProgram,
      costTokenProgram,
    })
    .transaction();

  tx.add(txId);

  return tx;
};

export const claimTx = async (
  buyer: PublicKey,
  icoPot: PublicKey,
  userPurchase: PublicKey,
  program: anchor.Program<IcoLaunchpad>,
  tokenProgram: PublicKey = TOKEN_PROGRAM_ID
) => {
  const icoData = await getIcoState(icoPot, program);
  console.log('ico seed', icoData.data.seed);

  const purchaseData = await getUserPurchaseState(userPurchase, program);
  console.log('user purchase seed', purchaseData.data.seed);

  const tx = new Transaction();

  const txId = await program.methods
    .claim(
      new anchor.BN(icoData.data.seed),
      new anchor.BN(purchaseData.data.seed)
    )
    .accounts({ buyer, tokenProgram })
    .transaction();

  tx.add(txId);

  return tx;
};

export const withdrawCostTx = async (
  authority: PublicKey,
  icoPot: PublicKey,
  program: anchor.Program<IcoLaunchpad>,
  tokenProgram: PublicKey = TOKEN_PROGRAM_ID
) => {
  const { data } = await getIcoState(icoPot, program);
  console.log('ico seed', data.seed);

  const tx = new Transaction();

  const txId = await program.methods
    .withdrawCost(new anchor.BN(data.seed))
    .accounts({
      authority,
      tokenProgram,
    })
    .transaction();

  tx.add(txId);

  return tx;
};

export const rescueTokenTx = async (
  admin: PublicKey,
  icoPot: PublicKey,
  program: anchor.Program<IcoLaunchpad>,
  tokenProgram: PublicKey = TOKEN_PROGRAM_ID
) => {
  const { data } = await getIcoState(icoPot, program);
  console.log('ico seed', data.seed);

  const tx = new Transaction();

  const txId = await program.methods
    .rescueToken(new anchor.BN(data.seed))
    .accounts({
      admin,
      tokenProgram,
    })
    .transaction();

  tx.add(txId);

  return tx;
};

/**
 * Fetch global pool PDA data
 */
export const getGlobalState = async (program: anchor.Program<IcoLaunchpad>) => {
  const [globalPool] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  try {
    let globalPoolData = await program.account.globalPool.fetch(globalPool);

    return {
      key: globalPool,
      data: globalPoolData,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Fetch ICO state PDA data
 */
export const getIcoState = async (
  icoPot: PublicKey,
  program: anchor.Program<IcoLaunchpad>
) => {
  try {
    let icoStateData = await program.account.icoState.fetch(icoPot);

    return {
      key: icoPot,
      data: icoStateData,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const findAllICOs = async (
  {
    owner,
    icoMint,
    costMint,
  }: { owner?: PublicKey; icoMint?: PublicKey; costMint?: PublicKey },
  program: anchor.Program<IcoLaunchpad>
) => {
  let filters: anchor.web3.GetProgramAccountsFilter[] = [
    {
      dataSize: ICO_STATE_SIZE,
    },
  ];

  if (owner) {
    filters.push({
      memcmp: { offset: 16, bytes: owner.toBase58() },
    });
  }

  if (icoMint) {
    filters.push({
      memcmp: { offset: 48, bytes: icoMint.toBase58() },
    });
  }

  if (costMint) {
    filters.push({
      memcmp: { offset: 96, bytes: costMint.toBase58() },
    });
  }

  const icoAccs = await program.provider.connection.getProgramAccounts(
    program.programId,
    { filters, encoding: 'base64' }
  );

  return icoAccs.map((icoAcc) => {
    let data: any = program.coder.accounts.decode<IcoState>(
      'icoState',
      icoAcc.account.data
    );
    data.seed = data.seed.toNumber();
    data.owner = data.owner.toBase58();

    data.icoMint = data.icoMint.toBase58();
    data.icoDecimals = data.icoDecimals.toNumber();
    data.amount = data.amount.toNumber();

    data.costMint = data.costMint.toBase58();
    data.startPrice = data.startPrice.toNumber();
    data.endPrice = data.endPrice.toNumber();
    data.startDate = data.startDate.toNumber();
    data.endDate = data.endDate.toNumber();

    data.bonusReserve = data.bonusReserve.toNumber();
    data.bonusPercentage = data.bonusPercentage;
    data.bonusActivator = data.bonusActivator;

    data.isClosed = data.isClosed;

    data.totalSold = data.totalSold.toNumber();
    data.totalReceived = data.totalReceived.toNumber();

    data.unlockPercentage = data.unlockPercentage;
    data.cliffPeriod = data.cliffPeriod.toNumber();
    data.vestingPercentage = data.vestingPercentage;
    data.vestingInterval = data.vestingInterval.toNumber();

    data.purchaseSeqNum = data.purchaseSeqNum.toNumber();

    return {
      key: icoAcc.pubkey.toBase58(),
      data,
    };
  });
};

/**
 * Fetch user purchase PDA data
 */
export const getUserPurchaseState = async (
  userPurchase: PublicKey,
  program: anchor.Program<IcoLaunchpad>
) => {
  try {
    let userPurchaseData = await program.account.userPurchase.fetch(
      userPurchase
    );

    return {
      key: userPurchase,
      data: userPurchaseData,
    };
  } catch (e) {
    console.error(e);

    return {
      key: userPurchase,
      data: null,
    };
  }
};

export const findPurchases = async (
  { owner, ico }: { owner?: PublicKey; ico?: PublicKey },
  program: anchor.Program<IcoLaunchpad>
) => {
  let filters: anchor.web3.GetProgramAccountsFilter[] = [
    {
      dataSize: USER_PURCHASE_SIZE,
    },
  ];

  if (owner) {
    filters.push({
      memcmp: { offset: 16, bytes: owner.toBase58() },
    });
  }
  if (ico) {
    filters.push({
      memcmp: { offset: 48, bytes: ico.toBase58() },
    });
  }

  const purchaseAccs = await program.provider.connection.getProgramAccounts(
    program.programId,
    { filters, encoding: 'base64' }
  );

  return purchaseAccs.map((purchaseAcc) => {
    let data: any = program.coder.accounts.decode<UserPurchase>(
      'userPurchase',
      purchaseAcc.account.data
    );
    data.seed = data.seed.toNumber();
    data.buyer = data.buyer.toBase58();
    data.ico = data.ico.toBase58();
    data.buyAmount = data.buyAmount.toNumber();
    data.buyDate = data.buyDate.toNumber();
    data.bonus = data.bonus.toNumber();
    data.lockedAmount = data.lockedAmount.toNumber();
    data.totalClaimed = data.totalClaimed.toNumber();

    return {
      key: purchaseAcc.pubkey.toBase58(),
      data,
    };
  });
};
