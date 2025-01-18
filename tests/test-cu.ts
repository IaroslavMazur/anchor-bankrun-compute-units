import * as anchor from "@coral-xyz/anchor";
import {
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  PublicKey,
} from "@solana/web3.js";

import * as token from "@solana/spl-token";
import { BanksClient, startAnchor, ProgramTestContext } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";

import { TestCu } from "../target/types/test_cu";

describe("test-cu", () => {
  let context: ProgramTestContext;
  let client: BanksClient;
  let provider: BankrunProvider;
  let signerKeys: Keypair;

  const program = anchor.workspace.TestCu as anchor.Program<TestCu>;

  before(async () => {
    context = await startAnchor("", [], []);
    provider = new BankrunProvider(context);
    anchor.setProvider(provider);
    client = context.banksClient;
    signerKeys = provider.wallet.payer;
  });

  it("Tests the CU consumption of a test Ix", async () => {
    const TOKEN_DECIMALS = 2;
    const freezeAuthority = null;

    const tokenMint = await createMint(
      client,
      signerKeys,
      signerKeys.publicKey,
      freezeAuthority,
      TOKEN_DECIMALS
    );

    const ix = await program.methods
      .testCuConsumption()
      .accounts({
        sender: signerKeys.publicKey,
        mint: tokenMint,
        tokenProgram: token.TOKEN_PROGRAM_ID,
      })
      .instruction();

    // Build, sign and process the tx
    await buildSignAndProcessTxFromIx(ix, signerKeys);
  });

  // HELPER FUNCTIONS

  async function createMint(
    banksClient: BanksClient,
    payer: Keypair,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey | null,
    decimals: number,
    mintKeypair = Keypair.generate(),
    programId = token.TOKEN_PROGRAM_ID
  ): Promise<PublicKey> {
    let rent = await banksClient.getRent();

    const mint = mintKeypair.publicKey;
    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        space: token.MINT_SIZE,
        lamports: Number(rent.minimumBalance(BigInt(token.MINT_SIZE))),
        programId,
      }),

      token.createInitializeMint2Instruction(
        mint,
        decimals,
        mintAuthority,
        freezeAuthority,
        programId
      )
    );
    [tx.recentBlockhash] = (await banksClient.getLatestBlockhash())!;
    tx.sign(payer, mintKeypair);

    await banksClient.processTransaction(tx);
    return mint;
  }

  async function buildSignAndProcessTxFromIx(
    ix: TransactionInstruction,
    signerKeys: Keypair
  ) {
    const tx = await initializeTxWithIx(ix);
    tx.sign(signerKeys);
    const banksTxMeta = await client.processTransaction(tx);

    console.log(
      "Compute Units consumed by the Tx: {}",
      banksTxMeta.computeUnitsConsumed.toString()
    );
  }

  async function initializeTxWithIx(
    ix: TransactionInstruction
  ): Promise<Transaction> {
    const res = await client.getLatestBlockhash();
    if (!res) throw new Error("Couldn't get the latest blockhash");

    let tx = new Transaction();
    tx.recentBlockhash = res[0];

    tx.add(ix);
    return tx;
  }
});
