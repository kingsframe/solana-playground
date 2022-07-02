import {
  Connection,
  PublicKey,
  Keypair,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import type {NextApiRequest, NextApiResponse} from 'next';
import {getNodeURL} from '@figment-solana/lib';
import {Buffer} from 'buffer';
import * as BufferLayout from '@solana/buffer-layout';

function createIncrementInstruction(): Buffer {
  const layout = BufferLayout.struct([BufferLayout.u8('instruction')]);
  const data = Buffer.alloc(layout.span);
  layout.encode({instruction: 0}, data);
  return data;
}
function createDecrementInstruction(): Buffer {
  const layout = BufferLayout.struct([BufferLayout.u8('instruction')]);
  const data = Buffer.alloc(layout.span);
  layout.encode({instruction: 1}, data);
  return data;
}

function createSetInstruction(val: number): Buffer {
  const layout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    BufferLayout.u32('value'),
  ]);
  const data = Buffer.alloc(layout.span);
  layout.encode({instruction: 2, value: val}, data);
  return data;
}

export default async function setter(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  try {
    const {greeter, secret, programId, network} = req.body;
    const url = getNodeURL(network);
    const connection = new Connection(url, 'confirmed');

    const greeterPublicKey = new PublicKey(greeter);
    const programKey = new PublicKey(programId);

    const payerSecretKey = new Uint8Array(JSON.parse(secret));
    const payerKeypair = Keypair.fromSecretKey(payerSecretKey);

    // this your turn to figure out
    // how to create this instruction
    const instruction = new TransactionInstruction({
      keys: [{pubkey: greeterPublicKey, isSigner: false, isWritable: true}],
      programId: programKey,
      data: createIncrementInstruction(),
    });

    // this your turn to figure out
    // how to create this transaction
    const hash = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(instruction),
      [payerKeypair],
    );

    res.status(200).json(hash);
  } catch (error) {
    console.error(error);
    res.status(500).json('Get balance failed');
  }
}
