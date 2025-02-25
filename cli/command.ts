import { program } from 'commander';
import { PublicKey } from '@solana/web3.js';
import {
  changeAdmin,
  getGlobalInfo,
  initProject,
  setClusterConfig,
  changeConfig,
  createIco,
  closeIco,
  buyToken,
  claim,
  withdrawCost,
  // rescueToken,
  getIcoInfo,
  getAllICOs,
  getUserPurchaseInfo,
  getAllPurchases,
} from './scripts';

// program.version('0.0.1');

programCommand('status')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    await setClusterConfig(env, keypair, rpc);

    console.log(await getGlobalInfo());
  });

programCommand('init')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);

    await initProject();
  });

programCommand('change-admin')
  .requiredOption('-a, --new_admin <string>', 'new admin address')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, new_admin } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    await setClusterConfig(env, keypair, rpc);

    //  update global info
    await changeAdmin(new_admin);
  });

programCommand('change-config')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .requiredOption('-p, --paused <boolean>')
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, paused } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);

    await changeConfig(paused === 'true');
  });

programCommand('create-ico')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .requiredOption('-i --ico_mint <string>')
  .option(
    '-ip --ico_is_token22 <boolean>',
    'should true if ico mint is token 2022'
  )
  .requiredOption('-c --cost_mint <string>')
  .option(
    '-cp --cost_is_token22 <boolean>',
    'should true if cost mint is token 2022'
  )
  .requiredOption('-m --amount <number>', 'ico token amount to sell')
  .requiredOption(
    '-stp --start_price <number>',
    'price of 1 token in cost tokens'
  )
  .requiredOption(
    '-enp --end_price <number>',
    'if 0 then price is fixed, else price grows liner from startPrice to endPrice based on sold tokens'
  )
  .requiredOption(
    '-std --start_date <number>',
    'timestamp when ICO starts. The date must be in future'
  )
  .requiredOption(
    '-end --end_date <number>',
    'timestamp when ICO ends, if 0 then ICO will be active until sell all tokens'
  )
  .requiredOption(
    '-br --bonus_reserve <number>',
    'amount of tokens that will be used for bonus'
  )
  .requiredOption(
    '-bp --bonus_percentage <number>',
    'percent of bonus (with 2 decimals) which will be added to bought amount'
  )
  .requiredOption(
    '-ba --bonus_activator <number>',
    'percent of total ICO tokens that should be bought to activate bonus (with 2 decimals)'
  )
  .requiredOption(
    '-up --unlock_percentage <number>',
    'percentage (with 2 decimals) of initially unlocked token'
  )
  .requiredOption('-cfp --cliff_period <number>', 'cliff period (in seconds)')
  .requiredOption(
    '-vp --vesting_percentage <number>',
    'percentage (with 2 decimals) of locked tokens will be unlocked every interval'
  )
  .requiredOption(
    '-vi --vesting_interval <number>',
    'interval (in seconds) of vesting'
  )
  .action(async (directory, cmd) => {
    const {
      env,
      keypair,
      rpc,
      ico_mint,
      cost_mint,
      ico_is_token22,
      cost_is_token22,
      amount,
      start_price,
      end_price,
      start_date,
      end_date,
      bonus_reserve,
      bonus_percentage,
      bonus_activator,
      unlock_percentage,
      cliff_period,
      vesting_percentage,
      vesting_interval,
    } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    await setClusterConfig(env, keypair, rpc);

    await createIco(
      new PublicKey(ico_mint),
      new PublicKey(cost_mint),
      {
        amount: amount as string,
        startPrice: start_price as string,
        endPrice: end_price as string,
        startDate: Number(start_date),
        endDate: Number(end_date),

        bonusReserve: bonus_reserve as string,
        bonusPercentage: Number(bonus_percentage),
        bonusActivator: Number(bonus_activator),

        unlockPercentage: Number(unlock_percentage),
        cliffPeriod: Number(cliff_period),
        vestingPercentage: Number(vesting_percentage),
        vestingInterval: Number(vesting_interval),
      },
      !ico_is_token22 ? undefined : true,
      !cost_is_token22 ? undefined : true
    );
  });

programCommand('close-ico')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .requiredOption('-i, --ico <string>', 'ico PDA address')
  .option(
    '-ip --ico_is_token22 <boolean>',
    'should true if ico mint is token 2022'
  )
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, ico, ico_is_token22 } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);

    await closeIco(new PublicKey(ico), !ico_is_token22 ? undefined : true);
  });

programCommand('buy-token')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .requiredOption('-i, --ico <string>')
  .requiredOption('-a, --amount <number>', 'amount to buy ico tokens')
  .option(
    '-ip --ico_is_token22 <boolean>',
    'should true if ico mint is token 2022'
  )
  .option(
    '-cp --cost_is_token22 <boolean>',
    'should true if cost mint is token 2022'
  )
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, ico, amount, ico_is_token22, cost_is_token22 } =
      cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);

    await buyToken(
      new PublicKey(ico),
      amount as string,
      !ico_is_token22 ? undefined : true,
      !cost_is_token22 ? undefined : true
    );
  });

programCommand('claim')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .requiredOption('-i, --ico <string>')
  .requiredOption('-u, --user_purchase <string>')
  .option(
    '-ip --ico_is_token22 <boolean>',
    'should true if ico mint is token 2022'
  )
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, ico, user_purchase, ico_is_token22 } =
      cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);

    await claim(
      new PublicKey(ico),
      new PublicKey(user_purchase),
      !ico_is_token22 ? undefined : true
    );
  });

programCommand('withdraw-cost')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .requiredOption('-i, --ico <string>')
  .option(
    '-cp --cost_is_token22 <boolean>',
    'should true if cost mint is token 2022'
  )
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, ico, cost_is_token22 } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);

    await withdrawCost(new PublicKey(ico), !cost_is_token22 ? undefined : true);
  });

// programCommand('rescue-token')
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   .requiredOption('-i, --ico <string>')
//   .option(
//     '-ip --ico_is_token22 <boolean>',
//     'should true if ico mint is token 2022'
//   )
//   .action(async (directory, cmd) => {
//     const { env, keypair, rpc, ico, ico_is_token22 } = cmd.opts();

//     console.log('Solana Cluster:', env);
//     console.log('Keypair Path:', keypair);
//     console.log('RPC URL:', rpc);

//     await setClusterConfig(env, keypair, rpc);

//     await rescueToken(new PublicKey(ico), !ico_is_token22 ? undefined : true);
//   });

programCommand('get-ico')
  .requiredOption('-i, --ico <string>')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, ico } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);

    console.log(await getIcoInfo(new PublicKey(ico)));
  });

programCommand('all-icos')
  .option('-o, --owner <string>', 'filter by ICO pot owner')
  .option('-i, --ico_mint <string>', 'filter by ICO token mint')
  .option('-c, --cost_mint <string>', 'filter by cost token mint')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, owner, ico_mint, cost_mint } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);

    console.dir(
      await getAllICOs({
        owner: owner ? new PublicKey(owner) : undefined,
        icoMint: ico_mint ? new PublicKey(ico_mint) : undefined,
        costMint: cost_mint ? new PublicKey(cost_mint) : undefined,
      }),
      {
        depth: null,
      }
    );
  });

programCommand('user-purchase')
  .requiredOption('-a, --user_purchase <string>')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, market, user_purchase } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);

    console.log(await getUserPurchaseInfo(new PublicKey(user_purchase)));
  });

programCommand('all-purchases')
  .option('-b, --buyer <string>', 'filter by buyer address')
  .option('-i, --ico <string>', 'filter by ico pot address')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, buyer, ico } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);

    console.dir(
      await getAllPurchases({
        buyer: buyer ? new PublicKey(buyer) : undefined,
        ico: ico ? new PublicKey(ico) : undefined,
      }),
      {
        depth: null,
      }
    );
  });

function programCommand(name: string) {
  return (
    program
      .command(name)
      .option('-e, --env <string>', 'Solana cluster env name', 'devnet') //mainnet-beta, testnet, devnet
      .option(
        '-r, --rpc <string>',
        'Solana cluster RPC name'
        // 'https://devnet.helius-rpc.com/?api-key=44b7171f-7de7-4e68-9d08-eff1ef7529bd'
        // 'https://flashy-cosmological-pallet.solana-mainnet.quiknode.pro/86e2f4bc350a6fb8dbcb110df4d030a205455f70/'
      )
      // .option('-r, --rpc <string>', 'Solana cluster RPC name', 'https://mainnet.helius-rpc.com/?api-key=99c6d984-537e-4569-955b-5e4703b73c0d')
      .option(
        '-k, --keypair <string>',
        'Solana wallet Keypair Path',
        '../deploy.json'
      )
  );
}

program.parse(process.argv);

/*

yarn script init
yarn script change-admin -n J9ja5QkewwMi9kG6JkCNxfLK9CoDGk3F4hZTNKQaKZe3
yarn script lock -m BV3bvkBqVawTghH4uCaba3MGgYs63XyxwX9CeULwvmKG

https://solana-mainnet.g.alchemy.com/v2/wsOJ8IVuGPfyljRfcZjpLrsVQu0_of-j

yarn script unlock -m AXXfo3sggcMLNvz3zRS2wJz8xy78DFbxmgcsUYkM5TzQ -k ../key/G2.json

yarn script user-status -a G2sc5mU3eLRkbRupnupzB3NTzZ85bnc9L1ReAre9dzFU
yarn script user-status -a 4EjZ4sGnvfLbW89AAzSehob7Rmkym7vCH3SMcThSx9q1

yarn script get-users
yarn script status

*/
