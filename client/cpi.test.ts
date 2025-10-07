import { LiteSVM } from "litesvm";
import {test,expect} from "bun:test"
import {
	PublicKey,
	Transaction,
	SystemProgram,
	Keypair,
	LAMPORTS_PER_SOL,
	TransactionInstruction,
} from "@solana/web3.js";

test("cpi one", () => {
	const svm = new LiteSVM();
    const contractPubKey = PublicKey.unique();
    svm.addProgramFromFile(contractPubKey,"../cpi-contract/target/deploy/cpi_contract.so");

	const payer = new Keypair();
	svm.airdrop(payer.publicKey, BigInt(LAMPORTS_PER_SOL));
	const receiver = PublicKey.unique();
	const blockhash = svm.latestBlockhash();
	const data_account = Keypair.generate();
	const ixs = [
		SystemProgram.createAccount({
			fromPubkey : payer.publicKey,
			newAccountPubkey : data_account.publicKey,
			lamports : Number(svm.minimumBalanceForRentExemption(BigInt(4))),
			space : 4,
			programId : contractPubKey
		}),
	];
	const tx = new Transaction();
	tx.recentBlockhash = blockhash;
	tx.add(...ixs);
	tx.sign(payer,data_account);
	svm.sendTransaction(tx);
	const balanceAfter = svm.getBalance(data_account.publicKey);
	expect(balanceAfter).toBe(svm.minimumBalanceForRentExemption(BigInt(4)));
});