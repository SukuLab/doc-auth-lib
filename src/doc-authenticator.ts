import { createHash, Hash } from 'crypto';
import { Contract, TransactionReceipt, BatchRequest } from 'web3/types';
import DocProof from './docproof';
import { logger } from './log';
import NodeManager from './nodemanager';
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

    public async isReady() : Promise<void> {
        await this.bc.isConnected();
        await this.bc.accountIsSetup();
        return;
    }

    public async readProof(buffer : Buffer) : Promise<DocProof> {
        let hash = DocAuthenticator.getHashOfFile(buffer);  
        let proof = await this.docAuthContract.methods.getProof(hash).call();
        logger.info("readProof( " + hash + " ) returned " + JSON.stringify(proof));
        let dProof : DocProof = {
            datahash: hash,
            sender: proof.sender,
            timestamp: proof.timestamp,
            uid: proof.id
        };
        return dProof;
    }

    public async addProof(buffer : Buffer, uid : string) : Promise<TransactionReceipt> {
        logger.info("addProof() called for id " + uid);
        let hash = DocAuthenticator.getHashOfFile(buffer);   
        logger.info("addProof(" + uid + " , " + hash + " )"); 
        let tx : any = this.docAuthContract.methods.addProof(uid, hash);
        let txObject = {
            gas: await tx.estimateGas(),
            data: tx.encodeABI(),
            from: this.bc.getAccountAddress(),
            to: this.docAuthContract.options.address
        };
        return this.bc.signAndSendTx(txObject);
    }

    private static getHashOfFile(buffer : Buffer) : string {
        return DocAuthenticator.sha256(buffer.toString('binary'));
    }

    private static sha256(message: string): string {
        let hash: Hash = createHash('sha256');
        hash.update(message);
        return hash.digest('hex');
    }

}

export default DocAuthenticator;
