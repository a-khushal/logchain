/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/logchain.json`.
 */
export type Logchain = {
  "address": "EPg3oEpf92FNPecbPfX7vkjjNVbNq6NyAdgPj9thL9Mt",
  "metadata": {
    "name": "logchain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "anchorRoot",
      "discriminator": [
        123,
        31,
        186,
        67,
        90,
        205,
        47,
        87
      ],
      "accounts": [
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "batchId",
          "type": "u64"
        },
        {
          "name": "serverId",
          "type": "string"
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
    }
  ],
  "events": [
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
      "name": "invalidBatchSequence",
      "msg": "Batch ID must be sequential"
    },
    {
      "code": 6001,
      "name": "serverIdTooLong",
      "msg": "Server ID too long (max 32 chars)"
    },
    {
      "code": 6002,
      "name": "invalidLogCount",
      "msg": "Log count must be 1-1000"
    },
    {
      "code": 6003,
      "name": "unauthorized",
      "msg": "Only authority can close"
    }
  ],
  "types": [
    {
      "name": "auditTrail",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "root",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
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
            "name": "serverId",
            "type": "string"
          },
          {
            "name": "logCount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "pubkey"
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
            "name": "root",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "batchId",
            "type": "u64"
          },
          {
            "name": "serverId",
            "type": "string"
          },
          {
            "name": "logCount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
