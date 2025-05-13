import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IcoLaunchpad } from "../target/types/ico_launchpad";
import {
  createAssociatedTokenAccount,
  createMint,
  mintTo,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import payerKpJson from "../id.json";
import { buyTokenTx, createIcoTx, createInitializeTx, findPurchases } from "../lib/scripts";
import { BN } from "bn.js";
import { ICO_POT_SEED, USER_PURCHASE_SEED } from "../lib/constant";

describe("ico-launchpad", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  let cluster = "devnet";
  let rpc =
    cluster == "devnet"
      ? "https://api.devnet.solana.com"
      : "http://localhost:8899";
  const connection = new Connection(rpc, "confirmed");
  const program = anchor.workspace.IcoLaunchpad as Program<IcoLaunchpad>;

  let adminKp = Keypair.fromSecretKey(new Uint8Array(payerKpJson));
  let mint: PublicKey;
  let costMint: PublicKey;

  it("prepare for test", async () => {
    mint = await createMint(
      connection,
      adminKp,
      adminKp.publicKey,
      null,
      6,
      undefined,
      { commitment: "confirmed" }
    );
    const ata = await createAssociatedTokenAccount(
      connection,
      adminKp,
      mint,
      adminKp.publicKey,
      { commitment: "confirmed" }
    );
    console.log("mint:", mint.toBase58());
    await mintTo(
      connection,
      adminKp,
      mint,
      ata,
      adminKp.publicKey,
      BigInt(new BN(10 ** 9).mul(new BN(10 ** 6)).toString()),
      undefined,
      { commitment: "confirmed" }
    );

    costMint = await createMint(
      connection,
      adminKp,
      adminKp.publicKey,
      null,
      6,
      undefined,
      { commitment: "confirmed" }
    );
    const ata_ = await createAssociatedTokenAccount(
      connection,
      adminKp,
      costMint,
      adminKp.publicKey,
      { commitment: "confirmed" }
    );
    console.log("costMint:", costMint.toBase58());
    await mintTo(
      connection,
      adminKp,
      costMint,
      ata_,
      adminKp.publicKey,
      BigInt(new BN(10 ** 9).mul(new BN(10 ** 6)).toString()),
      undefined,
      { commitment: "confirmed" }
    );
  });

  it("initialize contract", async () => {
    const tx = new Transaction().add(
      await createInitializeTx(adminKp.publicKey, program)
    );
    tx.instructions.unshift(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 })
    );
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = adminKp.publicKey;
    console.log(await connection.simulateTransaction(tx));

    const txId = await sendAndConfirmTransaction(connection, tx, [adminKp], {
      commitment: "confirmed",
    });

    console.log("txHash: ", txId);
  });

  it("create ico", async () => {
    const tx = await createIcoTx(
      adminKp.publicKey,
      mint,
      costMint,
      {
        amount: new BN(10 ** 6).mul(new BN(10 ** 6)),
        startPrice: new BN(10),
        endPrice: new BN(10 ** 6),
        startDate: new BN(Math.round(Date.now() / 1000) + 10),
        endDate: new BN(Math.round(Date.now() / 1000) + 10 ** 6),

        bonusReserve: new BN(10 ** 12),
        bonusPercentage: 100,
        bonusActivator: 100,

        unlockPercentage: 100,
        cliffPeriod: new BN(1000),
        vestingPercentage: 100,
        vestingInterval: new BN(10 ** 6),
      },
      program
    );
    tx.instructions.unshift(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 })
    );
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = adminKp.publicKey;
    console.log(await connection.simulateTransaction(tx));

    const txId = await sendAndConfirmTransaction(connection, tx, [adminKp], {
      commitment: "confirmed",
    });

    console.log("txHash: ", txId);
    await sleep(10000);
  });

  it("buy token", async () => {
    const icoPot = PublicKey.findProgramAddressSync(
      [Buffer.from(ICO_POT_SEED), new BN(0).toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];
    console.log("IcoPot key : ", icoPot.toBase58());

    const tx = await buyTokenTx(
      adminKp.publicKey,
      icoPot,
      "10000",
      "ref_code_sample",
      program
    );
    tx.instructions.unshift(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = adminKp.publicKey;
    console.log(await connection.simulateTransaction(tx));

    const txId = await sendAndConfirmTransaction(connection, tx, [adminKp], {
      commitment: "confirmed",
    });

    console.log("txHash: ", txId);

    await sleep(2000);

    const userPurchase = PublicKey.findProgramAddressSync(
      [
        Buffer.from(USER_PURCHASE_SEED),
        icoPot.toBytes(),
        new BN(0).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];

    const userPurchaseData = await program.account.userPurchase.fetch(
      userPurchase
    );
    console.log("User purchase data:", userPurchaseData);
  });

  it("fetch purchases", async () => {
    const space = program.account.userPurchase.size
    console.log("account space: ", space)
    const purchases = await findPurchases({buyer: new PublicKey("buytKapcCU8dtKnVC5Qiv4vnYVR9fqPfeobFV3yVJc7")}, program)
    console.log("purchases: ", purchases)
  });
})

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
