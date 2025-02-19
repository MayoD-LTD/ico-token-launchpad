`yarn ts-node init`
`yarn ts-node status`

```
global pool:  2jo2tsTdEDB27DTPaw1uZGiWo7mHunVpd3VBw7r57PnM
{
  admin: 'A9uQgPWh4Yfd3UcnwV3hTpBVp535fKtoxFgGW22fRWBi',
  totalIcoCount: 0,
  icoSeqNum: 0,
  isPaused: 0
}
```

`yarn ts-node change-admin -a A9uQgPWh4Yfd3UcnwV3hTpBVp535fKtoxFgGW22fRWBi --keypair ../deploy.json `

`yarn ts-node change-config -p true --keypair ../deploy.json`

```
global pool:  2jo2tsTdEDB27DTPaw1uZGiWo7mHunVpd3VBw7r57PnM
{
  admin: 'A9uQgPWh4Yfd3UcnwV3hTpBVp535fKtoxFgGW22fRWBi',
  totalIcoCount: 0,
  icoSeqNum: 0,
  isPaused: 1
}
```
`yarn ts-node change-config -p false --keypair ../deploy.json`
