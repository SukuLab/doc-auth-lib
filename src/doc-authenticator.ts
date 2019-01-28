import NodeManager from './nodemanager';
import Proof from './proof';
import { logger } from './log';
import { Contract } from 'web3-eth-contract/types';
import { TransactionReceipt, Transaction } from 'web3-core/types';
import { Hash, createHash } from 'crypto';
import { SignedTransaction } from 'web3-eth-accounts/types';
const docAuthContractJson = require('../blockchain/build/contracts/Docauth');

class DocAuthenticator {

    // Node
    private bc : NodeManager;

    // Smart Contracts
    private docAuthContract : Contract;

    constructor(nodeUrl : string, contractAddress : string, privateKey : string) {

        // Call constructor of NodeManager with connectionString
        this.bc = new NodeManager(nodeUrl, privateKey);      
        
        // Smart Contracts
        this.docAuthContract = new this.bc.node.eth.Contract(docAuthContractJson.abi);
        this.docAuthContract.options.address = contractAddress;

    }

    public async readLatestProofEntry(uid : string) : Promise<Proof> {
        let latestProof = await this.docAuthContract.methods.getLatestProofEntry(uid).call();
        logger.info("readLatestProofEntry() for uid " + uid + " returned " + latestProof.datahash);
        let proof : Proof = {
            datahash: latestProof.datahash,
            sender: latestProof.sender,
            timestamp: latestProof.timestamp
        };
        return proof;
    }

    public async addProof(file : File, uid : string) : Promise<TransactionReceipt> {
        logger.info("addProof() called for id " + uid);
        let hash = await DocAuthenticator.getHashOfFile(file);        
        let tx = this.docAuthContract.methods.addProof(uid, hash);
        let txObject : Transaction = {
            gas: await tx.estimateGas(),
            data: tx.encodeABI(),
            from: this.bc.getAccountAddress(),
            to: this.docAuthContract.options.address
        };
        let signedTx : SignedTransaction = await this.bc.node.eth.accounts.signTransaction(txObject, this.bc.account.privateKey);
        if (typeof signedTx.rawTransaction === "string") {        
            return this.bc.node.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on("transactionHash", (txHash : string) => {})
            .on('confirmation', (confirmationNumber : number, receipt : TransactionReceipt) => {})
            .on('receipt', (txReceipt : TransactionReceipt) => { 
                logger.info("Added proof entry for doc: " + uid + " Transaction: " + txReceipt.transactionHash);
                return txReceipt;
            });
        } else {
            return Promise.reject("Error during Tx signing. signedTx: " + signedTx);
        }
    }

    private static async getHashOfFile(file : File) : Promise<string> {
        return new Promise<string>( (resolve, revoke) => {
            let reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.addEventListener('load', function() {
                if (typeof this.result === "string") {
                    let hash = DocAuthenticator.sha256(this.result);
                    resolve(hash);
                } else {
                    revoke("Error: Could not read hash of file.")
                }
            });
        });
    }

    private static sha256(message: string): string {
        let hash: Hash = createHash('sha256');
        hash.update(message);
        return hash.digest('hex');
    }

}

export default DocAuthenticator;
