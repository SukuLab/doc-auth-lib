import { createHash, Hash } from 'crypto';
import { Contract, TransactionReceipt } from 'web3/types';
import { logger } from './log';
import NodeManager from './nodemanager';
import Proof from './proof';
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
        let tx : any = this.docAuthContract.methods.addProof(uid, hash);
        let txObject = {
            gas: await tx.estimateGas(),
            data: tx.encodeABI(),
            from: this.bc.getAccountAddress(),
            to: this.docAuthContract.options.address
        };
        let signedTx : any = await this.bc.node.eth.accounts.signTransaction(txObject, this.bc.account.privateKey);
        return this.bc.node.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on("transactionHash", (txHash : string) => {})
        .on('confirmation', (confirmationNumber : number, receipt : TransactionReceipt) => {})
        .on('receipt', (txReceipt : TransactionReceipt) => { 
            logger.info("Added proof entry for doc: " + uid + " Transaction: " + txReceipt.transactionHash);
            return txReceipt;
        });
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
