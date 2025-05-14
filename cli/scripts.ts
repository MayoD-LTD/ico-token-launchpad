import { Program, Wallet, web3 } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import fs from 'fs';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';

import IDL from '../target/idl/ico_launchpad.json';
import {
    buyTokenTx,
    changeAdminTx,
    claimTx,
    closeIcoTx,
    createChangeConfigTx,
    createIcoTx,
    createInitializeTx,
    findAllICOs,
    findPurchases,
    getGlobalState,
    getIcoState,
    getUnlocked,
    getUserPurchaseState,
    getValue,
    rescueTokenTx,
    withdrawCostTx,
} from '../lib/scripts';
import { IcoLaunchpad } from '../target/types/ico_launchpad';
import { CreateIcoInputs } from '../lib/types';
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { LogLevelDesc } from 'loglevel';
import * as log from 'loglevel';

let solConnection: Connection = null;
let program: Program<IcoLaunchpad> = null;
let provider: anchor.Provider = null;
let payer: NodeWallet | Wallet = null;

export const setLogLevel = (enabled: boolean, level?: LogLevelDesc) => {
    if (enabled) {
        log.enableAll();
        log.setLevel(level ?? 'debug');
    } else {
        log.disableAll();
    }
};

export const loadWalletFromKeypair = (keypair: string) => {
    const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(keypair, 'utf-8'))), {
        skipValidation: true,
    });
    const wallet = new NodeWallet(walletKeypair);
    return wallet;
};

/**
 * Set cluster, provider, program
 * If rpc != null use rpc, otherwise use cluster param
 * @param cluster - cluster ex. mainnet-beta, devnet ...
 * @param wallet - wallet
 * @param rpc - rpc
 */
export const setClusterConfig = async (cluster: web3.Cluster, wallet: NodeWallet | Wallet, rpc?: string) => {
    if (!rpc) {
        solConnection = new web3.Connection(web3.clusterApiUrl(cluster));
    } else {
        solConnection = new web3.Connection(rpc);
    }

    // Configure the client to use the local cluster.
    provider = new anchor.AnchorProvider(solConnection, wallet as any, {
        skipPreflight: false,
        commitment: 'confirmed',
    });
    anchor.setProvider(provider);
    payer = wallet;

    console.log(wallet);

    console.log('Wallet Address: ', wallet.publicKey.toBase58());

    // Generate the program client from IDL.
    program = new anchor.Program(IDL as IcoLaunchpad, provider);
    console.log('ProgramId: ', program.programId.toBase58());
};

/**
 * Initialize global pool
 */
export const initProject = async () => {
    try {
        const tx = new Transaction().add(await createInitializeTx(payer.publicKey, program));
        const { blockhash } = await solConnection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = payer.publicKey;

        payer.signTransaction(tx);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: 'confirmed',
        });

        console.log('txHash: ', txId);
    } catch (e) {
        console.log(e);
    }
};

/**
 * Change admin of the program
 */
export const changeAdmin = async (newAdmin: string) => {
    let newAdminAddr = null;
    try {
        newAdminAddr = new PublicKey(newAdmin);
    } catch {
        newAdminAddr = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(newAdmin, 'utf-8'))), {
            skipValidation: true,
        }).publicKey;
    }

    const tx = await changeAdminTx(payer.publicKey, newAdminAddr, program);

    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: 'confirmed',
    });

    console.log('txHash: ', txId);
};

/**
 * Change global config as admin
 */
export const changeConfig = async (paused: boolean) => {
    try {
        const tx = new Transaction().add(await createChangeConfigTx(payer.publicKey, paused, program));
        const { blockhash } = await solConnection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = payer.publicKey;

        payer.signTransaction(tx);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: 'confirmed',
        });

        console.log('txHash: ', txId);
    } catch (e) {
        console.log(e);
    }
};

/**
 * Create ICO
 */
export const createIco = async (
    icoMint: PublicKey,
    costMint: PublicKey,
    params: CreateIcoInputs,
    icoIsToken22: boolean = false, // need true if token is spl 2022
    costIsToken22: boolean = false // need true if token is spl 2022
) => {
    const tx = await createIcoTx(
        payer.publicKey,
        icoMint,
        costMint,
        {
            amount: new anchor.BN(params.amount),
            startPrice: new anchor.BN(params.startPrice),
            endPrice: new anchor.BN(params.endPrice),
            startDate: new anchor.BN(params.startDate),
            endDate: new anchor.BN(params.endDate),

            bonusReserve: new anchor.BN(params.bonusReserve),
            bonusPercentage: params.bonusPercentage,
            bonusActivator: params.bonusActivator,

            unlockPercentage: params.unlockPercentage,
            cliffPeriod: new anchor.BN(params.cliffPeriod),
            vestingPercentage: params.vestingPercentage,
            vestingInterval: new anchor.BN(params.vestingInterval),
        },
        program,
        icoIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID,
        costIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
    );

    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: 'confirmed',
    });

    console.log('txHash: ', txId);
};

export const createIcoWrapper = async (
    icoMint: PublicKey,
    costMint: PublicKey,
    params: CreateIcoInputs,
    icoIsToken22: boolean = false, // need true if token is spl 2022
    costIsToken22: boolean = false // need true if token is spl 2022
) => {
    return await createIcoTx(
        payer.publicKey,
        icoMint,
        costMint,
        {
            amount: new anchor.BN(params.amount),
            startPrice: new anchor.BN(params.startPrice),
            endPrice: new anchor.BN(params.endPrice),
            startDate: new anchor.BN(params.startDate),
            endDate: new anchor.BN(params.endDate),

            bonusReserve: new anchor.BN(params.bonusReserve),
            bonusPercentage: params.bonusPercentage,
            bonusActivator: params.bonusActivator,

            unlockPercentage: params.unlockPercentage,
            cliffPeriod: new anchor.BN(params.cliffPeriod),
            vestingPercentage: params.vestingPercentage,
            vestingInterval: new anchor.BN(params.vestingInterval),
        },
        program,
        icoIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID,
        costIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
    );
};

/**
 * Close ICO with owner authority
 */
export const closeIco = async (
    icoPot: PublicKey,
    icoIsToken22: boolean = false // need true if token is spl 2022
) => {
    try {
        const tx = await closeIcoTx(
            payer.publicKey,
            icoPot,
            program,
            icoIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
        );

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: 'confirmed',
        });

        console.log('txHash: ', txId);
    } catch (e) {
        console.log(e);
    }
};

export const buyTokenWrapper = async (
    icoPot: PublicKey,
    amount: string,
    refCode: string,
    icoIsToken22: boolean = false, // need true if token is spl 2022
    costIsToken22: boolean = false // need true if token is spl 2022
) => {
    return await buyTokenTx(
        payer.publicKey,
        icoPot,
        amount,
        refCode,
        program,
        icoIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID,
        costIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
    );
};

export const buyToken = async (
    icoPot: PublicKey,
    amount: string,
    refCode: string,
    icoIsToken22: boolean = false, // need true if token is spl 2022
    costIsToken22: boolean = false // need true if token is spl 2022
) => {
    const tx = await buyTokenTx(
        payer.publicKey,
        icoPot,
        amount,
        refCode,
        program,
        icoIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID,
        costIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
    );

    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: 'confirmed',
    });

    console.log('txHash: ', txId);
};

export const claimWrapper = async (
    icoPot: PublicKey,
    userPurchase: PublicKey,
    icoIsToken22: boolean = false // need true if token is spl 2022
) => {
    return await claimTx(
        payer.publicKey,
        icoPot,
        userPurchase,
        program,
        icoIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
    );
};

export const claim = async (
    icoPot: PublicKey,
    userPurchase: PublicKey,
    icoIsToken22: boolean = false // need true if token is spl 2022
) => {
    const tx = await claimTx(
        payer.publicKey,
        icoPot,
        userPurchase,
        program,
        icoIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
    );

    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: 'confirmed',
    });

    console.log('txHash: ', txId);
};

export const withdrawCost = async (
    icoPot: PublicKey,
    costIsToken22: boolean = false // need true if token is spl 2022
) => {
    const tx = await withdrawCostTx(
        payer.publicKey,
        icoPot,
        program,
        costIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
    );

    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: 'confirmed',
    });

    console.log('txHash: ', txId);
};

export const rescueToken = async (
    icoPot: PublicKey,
    icoIsToken22: boolean = false // need true if token is spl 2022
) => {
    const tx = await rescueTokenTx(
        payer.publicKey,
        icoPot,
        program,
        icoIsToken22 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
    );

    const txId = await provider.sendAndConfirm(tx, [], {
        commitment: 'confirmed',
    });

    console.log('txHash: ', txId);
};

export const getGlobalInfo = async () => {
    const { data, key } = await getGlobalState(program);
    console.log('global pool: ', key.toBase58());

    return {
        admin: data.admin.toBase58(),
        totalIcoCount: data.totalIcoCount.toNumber(),
        icoSeqNum: data.icoSeqNum.toNumber(),
        isPaused: data.isPaused,
    };
};

export const getIcoInfo = async (icoPot: PublicKey) => {
    const { data, key } = await getIcoState(icoPot, program);
    console.log('ico pot: ', key.toBase58());

    return {
        seed: data.seed.toNumber(),
        owner: data.owner.toBase58(),

        icoMint: data.icoMint.toBase58(),
        icoDecimals: data.icoDecimals.toNumber(),
        amount: data.amount.toNumber(),

        costMint: data.costMint.toBase58(),
        startPrice: data.startPrice.toNumber(),
        endPrice: data.endPrice.toNumber(),
        startDate: data.startDate.toNumber(),
        endDate: data.endDate.toNumber(),

        bonusReserve: data.bonusReserve.toNumber(),
        bonusPercentage: data.bonusPercentage,
        bonusActivator: data.bonusActivator,

        isClosed: data.isClosed,

        totalSold: data.totalSold.toNumber(),
        totalReceived: data.totalReceived.toNumber(),

        unlockPercentage: data.unlockPercentage,
        cliffPeriod: data.cliffPeriod.toNumber(),
        vestingPercentage: data.vestingPercentage,
        vestingInterval: data.vestingInterval.toNumber(),

        purchaseSeqNum: data.purchaseSeqNum.toNumber(),
    };
};

export const getCostInfo = async (icoPot: PublicKey, amount: string) => {
    const { data, key } = await getIcoState(icoPot, program);
    console.log('ico pot: ', key.toBase58());

    const { availableAmount, value } = getValue(data, new anchor.BN(amount));

    return {
        availableAmount: availableAmount.toNumber(),
        value: value.toNumber(),
    };
};

export const getAllICOs = async ({
    owner,
    icoMint,
    costMint,
}: {
    owner?: PublicKey;
    icoMint?: PublicKey;
    costMint?: PublicKey;
}) => {
    const data = await findAllICOs({ owner, icoMint, costMint }, program);
    return data;
};

export const getUserPurchaseInfo = async (userPurchase: PublicKey) => {
    const { data, key } = await getUserPurchaseState(userPurchase, program);
    console.log('user purchase: ', key.toBase58());

    const icoData = (await getIcoState(data.ico, program)).data;
    console.log('ico pot: ', data.ico.toBase58());

    return {
        seed: data.seed.toNumber(),
        buyer: data.buyer.toBase58(),
        ico: data.ico.toBase58(),
        buyAmount: data.buyAmount.toNumber(),
        buyDate: data.buyDate.toNumber(),
        bonus: data.bonus.toNumber(),
        lockedAmount: data.lockedAmount.toNumber(),
        totalClaimed: data.totalClaimed.toNumber(),
        unlockedAmount: getUnlocked(data, icoData).toNumber(),
        refCode: data.refCode !== '' ? data.refCode : null,
    };
};

export const getAllPurchases = async ({ buyer, ico }: { buyer?: PublicKey; ico?: PublicKey }) => {
    const data = await findPurchases({ buyer, ico }, program);
    return data;
};
