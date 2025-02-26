/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ico_launchpad.json`.
 */
export type IcoLaunchpad = {
  "address": "373N2AQZikw4v5w1dq2TrWdQDRh87jhj93zBdGH25CVX",
  "metadata": {
    "name": "icoLaunchpad",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyToken",
      "docs": [
        "Purchase ico token by paying cost token"
      ],
      "discriminator": [
        138,
        127,
        14,
        91,
        38,
        87,
        115,
        105
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "icoPot",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  99,
                  111,
                  45,
                  112,
                  111,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "seed"
              }
            ]
          }
        },
        {
          "name": "icoMint",
          "relations": [
            "icoPot"
          ]
        },
        {
          "name": "costMint",
          "relations": [
            "icoPot"
          ]
        },
        {
          "name": "userPurchase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  112,
                  117,
                  114,
                  99,
                  104,
                  97,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "ico_pot.purchase_seq_num",
                "account": "icoState"
              }
            ]
          }
        },
        {
          "name": "buyerIcoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "icoTokenProgram"
              },
              {
                "kind": "account",
                "path": "icoMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "icoTokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "icoPot"
              },
              {
                "kind": "account",
                "path": "icoTokenProgram"
              },
              {
                "kind": "account",
                "path": "icoMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "buyerCostAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "costTokenProgram"
              },
              {
                "kind": "account",
                "path": "costMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "costEscrowVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "icoPot"
              },
              {
                "kind": "account",
                "path": "costTokenProgram"
              },
              {
                "kind": "account",
                "path": "costMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "icoTokenProgram"
        },
        {
          "name": "costTokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeConfig",
      "docs": [
        "Admin can change global config"
      ],
      "discriminator": [
        24,
        158,
        114,
        115,
        94,
        210,
        244,
        233
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "globalPool"
          ]
        },
        {
          "name": "globalPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "u8"
        }
      ]
    },
    {
      "name": "claim",
      "docs": [
        "Claim unlocked token as buyer"
      ],
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "icoPot",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  99,
                  111,
                  45,
                  112,
                  111,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "icoSeed"
              }
            ]
          }
        },
        {
          "name": "icoMint",
          "relations": [
            "icoPot"
          ]
        },
        {
          "name": "userPurchase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  112,
                  117,
                  114,
                  99,
                  104,
                  97,
                  115,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "purchaseSeed"
              }
            ]
          }
        },
        {
          "name": "buyerIcoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "icoMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "icoTokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "icoPot"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "icoMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "icoSeed",
          "type": "u64"
        },
        {
          "name": "purchaseSeed",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeIco",
      "docs": [
        "Close ICO pot with owner authority"
      ],
      "discriminator": [
        236,
        192,
        28,
        5,
        41,
        203,
        104,
        223
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "icoPot",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  99,
                  111,
                  45,
                  112,
                  111,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "seed"
              }
            ]
          }
        },
        {
          "name": "icoMint",
          "relations": [
            "icoPot"
          ]
        },
        {
          "name": "authorityIcoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "icoMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "icoTokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "icoPot"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "icoMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createIco",
      "docs": [
        "Create ICO pot"
      ],
      "discriminator": [
        12,
        83,
        125,
        16,
        133,
        67,
        173,
        93
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "icoPot",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  99,
                  111,
                  45,
                  112,
                  111,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "global_pool.ico_seq_num",
                "account": "globalPool"
              }
            ]
          }
        },
        {
          "name": "icoMint"
        },
        {
          "name": "costMint"
        },
        {
          "name": "creatorIcoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "icoTokenProgram"
              },
              {
                "kind": "account",
                "path": "icoMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "icoTokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "icoPot"
              },
              {
                "kind": "account",
                "path": "icoTokenProgram"
              },
              {
                "kind": "account",
                "path": "icoMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "costEscrowVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "icoPot"
              },
              {
                "kind": "account",
                "path": "costTokenProgram"
              },
              {
                "kind": "account",
                "path": "costMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "icoTokenProgram"
        },
        {
          "name": "costTokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createIcoParams"
            }
          }
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "* Initialize global pool"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "rescueToken",
      "docs": [
        "Force withdraw all tokens from Ico pot as admin"
      ],
      "discriminator": [
        227,
        248,
        168,
        149,
        165,
        80,
        20,
        89
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "icoPot",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  99,
                  111,
                  45,
                  112,
                  111,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "seed"
              }
            ]
          }
        },
        {
          "name": "icoMint",
          "relations": [
            "icoPot"
          ]
        },
        {
          "name": "adminIcoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "icoMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "icoTokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "icoPot"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "icoMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferAdmin",
      "docs": [
        "Admin can transfer admin authority"
      ],
      "discriminator": [
        42,
        242,
        66,
        106,
        228,
        10,
        111,
        156
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "globalPool"
          ]
        },
        {
          "name": "globalPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "withdrawCost",
      "docs": [
        "Withdraw cost token collection as owner"
      ],
      "discriminator": [
        24,
        29,
        195,
        242,
        103,
        79,
        189,
        71
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "icoPot",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  99,
                  111,
                  45,
                  112,
                  111,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "seed"
              }
            ]
          }
        },
        {
          "name": "costMint",
          "relations": [
            "icoPot"
          ]
        },
        {
          "name": "authorityIcoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "costMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "costEscrowVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "icoPot"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "costMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalPool",
      "discriminator": [
        162,
        244,
        124,
        37,
        148,
        94,
        28,
        50
      ]
    },
    {
      "name": "icoState",
      "discriminator": [
        219,
        70,
        204,
        53,
        128,
        154,
        51,
        108
      ]
    },
    {
      "name": "userPurchase",
      "discriminator": [
        23,
        17,
        96,
        83,
        125,
        230,
        223,
        233
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAdmin",
      "msg": "Admin address dismatch"
    },
    {
      "code": 6001,
      "name": "isPaused",
      "msg": "Admin paused whole launchpad"
    },
    {
      "code": 6002,
      "name": "invalidDateConfig",
      "msg": "ICO date configs should be future time"
    },
    {
      "code": 6003,
      "name": "insufficientTokenBalance",
      "msg": "Token account balance insufficient"
    },
    {
      "code": 6004,
      "name": "invalidPercentageValue",
      "msg": "Percentage value should less than 10000 = 100%"
    },
    {
      "code": 6005,
      "name": "invalidIcoOwner",
      "msg": "ICO owner does not match with passed address"
    },
    {
      "code": 6006,
      "name": "noAvailableTokens",
      "msg": "All ICO tokens sold out"
    },
    {
      "code": 6007,
      "name": "potIsClosed",
      "msg": "ICO is closed by owner or admin"
    },
    {
      "code": 6008,
      "name": "alreadyClosed",
      "msg": "ICO is closed already"
    },
    {
      "code": 6009,
      "name": "incorrectIcoAddress",
      "msg": "User purchase ICO pot address not matched with passed account"
    }
  ],
  "types": [
    {
      "name": "createIcoParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "startPrice",
            "type": "u64"
          },
          {
            "name": "endPrice",
            "type": "u64"
          },
          {
            "name": "startDate",
            "type": "i64"
          },
          {
            "name": "endDate",
            "type": "i64"
          },
          {
            "name": "bonusReserve",
            "type": "u64"
          },
          {
            "name": "bonusPercentage",
            "type": "u16"
          },
          {
            "name": "bonusActivator",
            "type": "u16"
          },
          {
            "name": "unlockPercentage",
            "type": "u16"
          },
          {
            "name": "cliffPeriod",
            "type": "i64"
          },
          {
            "name": "vestingPercentage",
            "type": "u16"
          },
          {
            "name": "vestingInterval",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "globalPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "totalIcoCount",
            "type": "u64"
          },
          {
            "name": "icoSeqNum",
            "type": "u64"
          },
          {
            "name": "isPaused",
            "type": "u8"
          },
          {
            "name": "extra",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "icoState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seed",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "icoMint",
            "type": "pubkey"
          },
          {
            "name": "icoDecimals",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "costMint",
            "type": "pubkey"
          },
          {
            "name": "startPrice",
            "type": "u64"
          },
          {
            "name": "endPrice",
            "type": "u64"
          },
          {
            "name": "startDate",
            "type": "i64"
          },
          {
            "name": "endDate",
            "type": "i64"
          },
          {
            "name": "bonusReserve",
            "type": "u64"
          },
          {
            "name": "bonusPercentage",
            "type": "u16"
          },
          {
            "name": "bonusActivator",
            "type": "u16"
          },
          {
            "name": "isClosed",
            "type": "u8"
          },
          {
            "name": "totalSold",
            "type": "u64"
          },
          {
            "name": "totalReceived",
            "type": "u64"
          },
          {
            "name": "unlockPercentage",
            "type": "u16"
          },
          {
            "name": "cliffPeriod",
            "type": "i64"
          },
          {
            "name": "vestingPercentage",
            "type": "u16"
          },
          {
            "name": "vestingInterval",
            "type": "i64"
          },
          {
            "name": "purchaseSeqNum",
            "type": "u64"
          },
          {
            "name": "extra",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "userPurchase",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seed",
            "type": "u64"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "ico",
            "type": "pubkey"
          },
          {
            "name": "buyAmount",
            "type": "u64"
          },
          {
            "name": "buyDate",
            "type": "i64"
          },
          {
            "name": "bonus",
            "type": "u64"
          },
          {
            "name": "lockedAmount",
            "type": "u64"
          },
          {
            "name": "totalClaimed",
            "type": "u64"
          },
          {
            "name": "extra",
            "type": "u128"
          }
        ]
      }
    }
  ]
};
