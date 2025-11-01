"use client";

import { Program, AnchorProvider, setProvider, type Idl } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import idl from "@/lib/program/logchain.json";
import type { Logchain } from "@/lib/program/logchain";

export const useProgram = () => {
  const { wallet, signTransaction, signAllTransactions, publicKey } = useWallet();

  const connection = new Connection(
    `https://devnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_KEY}`,
    {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    }
  );

  if (!wallet || !publicKey || !signTransaction || !signAllTransactions) return null;

  const signer = { publicKey, signTransaction, signAllTransactions };
  const provider = new AnchorProvider(connection, signer, {
    commitment: "confirmed",
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
  setProvider(provider);

  return new Program(idl as Idl, provider) as Program<Logchain>;
};