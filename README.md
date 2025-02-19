# ICO-Launchpad
ICO Launchpad Smart contract for solana spl tokens and spl token 2022

## Prerequirements

Need to build up anchor development environment <br/>
```
anchor version 0.30.1
solana version 1.18.18
node version 23.3.0
```

## Program Deployment

- Prepare anchor development environments.
- Prepare around 7 SOL in the deploy wallet keypair. (3 SOL for deploy cost and should hold around 4 SOL for redeployment)
- Confirm Network cluster in `Anchor.toml` file : f.e. `[programs.devnet]`, `cluster = "devnet"`
- Confirm deploy authority wallet keypair location : f.e. `wallet = "../deploy.json"
- Configure solana cli with deploy authority keypair and deploying cluster : f.e. `solana config set -h`
- Build program with `anchor build`.
- Copy and paste the result deploy scripts from Build terminal message: f.e. `solana program deploy /home/ubuntu/project/target/deploy/nut_marketplace.so`
- Or can use `anchor deploy` if configured `Anchor.toml` correctly.

### To Change Program Address

- Delete the program keypair in `/target/deploy/nut_marketplace-keypair.json`
- Build project with `anchor build`. This will generate new keypair
- Get the address of new keypair with `solana address --keypair ./target/deploy/nut_marketplace-keypair.json`
- Change program addresses in project code. `Anchor.toml`, `/program/nut_marketplace/src/lib.rs`
- Build program object again with `anchor build`
- Deploy newly built so file with `solana program deploy`
<br/><br/>
Or can use `anchor keys sync` / `anchor build` / `anchor deploy` with anchor-cli.

## Cli Command usage

Able to run all commands in `/cli/command.ts` file by running `yarn ts-node xxx`.
When you get this error <br/>
`Error: Provider local is not available on browser.`
You can run this command `export BROWSER=` once.

### Install Dependencies

- Install `node` and `yarn`
- Install `ts-node` as global command

### Init Program

- Initialize program with `init` command

## Commands Help

### init
Initialize Program with creating Global PDA account as Contract Deployer.

### status
Get global PDA info of program. This will show the launchpad admin authority and state represent whether the whole launchpad is paused or not.

### change-config
Admin able to pause or resume launchpad with this command as Admin.
- `paused` true or false

### change-admin
Admin able to transfer admin authority to another.
- `new_admin` is the new authority address

### create-ico
Create ICO Pot and become its owner.
- `ico_mint` is the ICO token mint
- `ico_is_token22` is option should be true if the ICO token is spl token 2022
- `cost_mint` is the cost token mint
- `cost_is_token22` is option should be true if the cost token is spl token 2022
- `amount` is the amount to selling ICO tokens
- `start_price` is price of 1 ICO token in cost tokens. Has same decimal with ICO token
- `end_price` if 0 then price is fixed, else price grows liner from startPrice to endPrice based on sold tokens
- `start_date` timestamp when ICO starts. The date must be in future
- `end_date` timestamp when ICO ends, if 0 then ICO will be active until sell all tokens
- `bonus_reserve` amount of tokens that will be used for bonus
- `bonus_percentage` percent of bonus (with 2 decimals) which will be added to bought amount
- `bonus_activator` percent of total ICO tokens that should be bought to activate bonus (with 2 decimals)
- `unlock_percentage` percentage (with 2 decimals) of initially unlocked token
- `cliff_period` cliff period (in seconds)
- `vesting_percentage` percentage (with 2 decimals) of locked tokens will be unlocked every interval
- `vesting_interval` interval (in seconds) of vesting

### close-ico
ICO Pot owner able to close and refund remained ICO tokens.
- `ico` is the PDA address of ICO Pot
- `ico_is_token22` is option should be true if the ICO token is spl token 2022

### buy-token
Buyers can purchase the ICO token by paying with cost tokens.
- `ico` is the PDA address of ICO Pot
- `amount` is the quantity of buying
- `ico_is_token22` is option should be true if the ICO token is spl token 2022
- `cost_is_token22` is option should be true if the cost token is spl token 2022

### claim
Buyers can claim unlocked ICO tokens if has vesting from their purchase.
- `ico` is the PDA address of ICO Pot
- `ico_is_token22` is option should be true if the ICO token is spl token 2022

### withdraw-cost
ICO owner able to withdraw collected cost tokens.
- `ico` is the PDA address of ICO Pot
- `cost_is_token22` is option should be true if the cost token is spl token 2022

### rescue-token
Admin able to force withdraw any tokens from a certain ICO Pot.
- `ico` is the PDA address of ICO Pot
- `ico_is_token22` is option should be true if the ICO token is spl token 2022

### get-ico
Get ICO PDA info. This will show the ICO states and configs.
- `ico` is the PDA address of ICO Pot

### all-icos
Get all created ICO Pots.
- `owner` is option to filter by ICO Pot owner address
- `ico_mint` is option to filter by ICO token mint
- `cost_mint` is option to filter by cost token mint

### user-purchase
Get a user purchase PDA info.
- `user_purchase` is PDA address of user purchase

### all-purchases
Get all user purchases info.
- `buyer` is option to filter by the buyer address
- `ico` is option to filter by the ICO Pot address

## Notes for FE Integration

For the FE side web3 integration, the scripts in `lib` directory can be use without no change.
The only thing the FE dev should change is providing `web3 connection` & the `anchor program` object from idl.
There is the code part for the `keypair` wallet based `cli` environement case in `cli/scripts`.
Should configure properly in `BROWSER` environment.

## Devnet Test Result

Deployed program on devnet: `373N2AQZikw4v5w1dq2TrWdQDRh87jhj93zBdGH25CVX` \
Attached tested commands and snapshot of the CLI results.
Check `command.md` file!
