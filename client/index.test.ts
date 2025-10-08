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

test("one transfer", () => {
	const svm = new LiteSVM();
    const doubleContractPubKey = PublicKey.unique();
	const contractPubKey = PublicKey.unique();
    svm.addProgramFromFile(contractPubKey,"../cpi-contract/target/deploy/cpi_contract.so");
	svm.addProgramFromFile(doubleContractPubKey,"../target/deploy/cpi_solana.so");

	const payer = new Keypair();
	svm.airdrop(payer.publicKey, BigInt(LAMPORTS_PER_SOL));
	const data_account = Keypair.generate();

	const ixs = [
		SystemProgram.createAccount({
			fromPubkey : payer.publicKey,
			newAccountPubkey : data_account.publicKey,
			lamports : Number(svm.minimumBalanceForRentExemption(BigInt(4))),
			space : 4,
			programId : doubleContractPubKey
		}),
	];

	const tx = new Transaction();
	const blockhash = svm.latestBlockhash();
	tx.recentBlockhash = blockhash;
	tx.add(...ixs);
	tx.sign(payer,data_account);
	svm.sendTransaction(tx);
	const balanceAfter = svm.getBalance(data_account.publicKey);
	expect(balanceAfter).toBe(svm.minimumBalanceForRentExemption(BigInt(4)));

	const doubleIt = () => {
		const ix2 = new TransactionInstruction({
			keys : [
				{pubkey : data_account.publicKey , isSigner : false , isWritable : true},
				{pubkey : doubleContractPubKey, isSigner : false, isWritable : false},
			],
			programId : contractPubKey,
			data : Buffer.from("")
		})
		const tx2 = new Transaction();
		tx2.recentBlockhash = svm.latestBlockhash();
		tx2.add(ix2);
		tx2.sign(payer);
		const res = svm.sendTransaction(tx2);
		console.log(res.toString());
		svm.expireBlockhash();
	}

	doubleIt();
	doubleIt();
	doubleIt(); 

	const data = svm.getAccount(data_account.publicKey);
	expect(data?.data[0]).toBe(4);
	console.log(data);
});
