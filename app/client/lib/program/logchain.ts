/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/logchain.json`.
 */
export type Logchain = {
  "address": "By33UGtQN9XjEUbV1Ak7K7waRHHncqE8K8zzqCEoKsqM",
  "metadata": {
    "name": "logchain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addLogEntry",
      "discriminator": [
        42,
        210,
        137,
        166,
        54,
        34,
        50,
        25
      ],
      "accounts": [
        {
          "name": "serverAccount",
          "writable": true
        },
        {
          "name": "logEntry",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "entryData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "anchorBatch",
      "discriminator": [
        140,
        176,
        14,
        153,
        61,
        146,
        232,
        200
      ],
      "accounts": [
        {
          "name": "serverAccount",
          "writable": true
        },
        {
          "name": "trail",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  103,
                  99,
                  104,
                  97,
                  105,
                  110,
                  45,
                  116,
                  114,
                  97,
                  105,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "serverAccount"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "batchId",
          "type": "u64"
        },
        {
          "name": "logCount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeTrail",
      "discriminator": [
        82,
        101,
        130,
        97,
        179,
        50,
        161,
        61
      ],
      "accounts": [
        {
          "name": "trail",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "deactivateServer",
      "discriminator": [
        116,
        58,
        72,
        223,
        17,
        177,
        251,
        145
      ],
      "accounts": [
        {
          "name": "serverAccount",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "registerServer",
      "discriminator": [
        41,
        21,
        9,
        205,
        172,
        45,
        50,
        34
      ],
      "accounts": [
        {
          "name": "serverAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  114,
                  118,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "serverId"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "stake",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "serverId",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "verifyEntry",
      "discriminator": [
        19,
        109,
        48,
        124,
        244,
        122,
        229,
        51
      ],
      "accounts": [
        {
          "name": "logEntry"
        },
        {
          "name": "serverAccount"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "auditTrail",
      "discriminator": [
        171,
        223,
        253,
        181,
        134,
        88,
        66,
        26
      ]
    },
    {
      "name": "logEntry",
      "discriminator": [
        144,
        171,
        70,
        10,
        193,
        153,
        166,
        90
      ]
    },
    {
      "name": "serverAccount",
      "discriminator": [
        217,
        98,
        62,
        130,
        20,
        150,
        79,
        126
      ]
    }
  ],
  "events": [
    {
      "name": "entryVerified",
      "discriminator": [
        167,
        206,
        88,
        150,
        189,
        128,
        119,
        198
      ]
    },
    {
      "name": "logEntryAdded",
      "discriminator": [
        153,
        33,
        253,
        162,
        226,
        20,
        50,
        162
      ]
    },
    {
      "name": "rootAnchored",
      "discriminator": [
        236,
        25,
        151,
        230,
        163,
        47,
        183,
        125
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "serverIdTooLong",
      "msg": "Server ID is too long (max 32 chars)"
    },
    {
      "code": 6001,
      "name": "descriptionTooLong",
      "msg": "Description is too long (max 100 chars)"
    },
    {
      "code": 6002,
      "name": "serverInactive",
      "msg": "Server is not active"
    },
    {
      "code": 6003,
      "name": "invalidBatchSequence",
      "msg": "Batch ID must be sequential"
    },
    {
      "code": 6004,
      "name": "invalidLogCount",
      "msg": "Log count must be between 1 and 10000"
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Only authority can perform this action"
    },
    {
      "code": 6006,
      "name": "entryTooLarge",
      "msg": "Entry too large (max 1024 bytes)"
    },
    {
      "code": 6007,
      "name": "entryServerMismatch",
      "msg": "Entry server mismatch"
    },
    {
      "code": 6008,
      "name": "insufficientEntries",
      "msg": "Insufficient entries to anchor"
    }
  ],
  "types": [
    {
      "name": "auditTrail",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "server",
            "type": "pubkey"
          },
          {
            "name": "batchId",
            "type": "u64"
          },
          {
            "name": "nextBatchId",
            "type": "u64"
          },
          {
            "name": "rootHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "entriesInBatch",
            "type": "u64"
          },
          {
            "name": "entriesAnchored",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "anchorSlot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "entryVerified",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "server",
            "type": "pubkey"
          },
          {
            "name": "entryIndex",
            "type": "u64"
          },
          {
            "name": "entryHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "verifiedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "logEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "server",
            "type": "pubkey"
          },
          {
            "name": "entryIndex",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "entryHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "previousHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "dataHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "data",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "logEntryAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "server",
            "type": "pubkey"
          },
          {
            "name": "entryIndex",
            "type": "u64"
          },
          {
            "name": "entryHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "rootAnchored",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "server",
            "type": "pubkey"
          },
          {
            "name": "batchId",
            "type": "u64"
          },
          {
            "name": "rootHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "entriesInBatch",
            "type": "u64"
          },
          {
            "name": "entriesAnchored",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "serverAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "serverId",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "registeredAt",
            "type": "i64"
          },
          {
            "name": "stake",
            "type": "u64"
          },
          {
            "name": "entryCount",
            "type": "u64"
          },
          {
            "name": "lastEntryHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "lastAnchorSlot",
            "type": "u64"
          }
        ]
      }
    }
  ]
};