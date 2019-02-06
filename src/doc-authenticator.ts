import { createHash, Hash } from 'crypto';
import DocProof from './docproof';
import { logger } from './log';
import NodeManager from './nodemanager';
import { Contract } from 'web3-eth-contract/types';
import { TransactionReceipt } from 'web3-core/types';
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
        this.bc.checkIfContractExists(contractAddress);
        this.docAuthContract = new this.bc.node.eth.Contract(docAuthContractJson.abi);
        this.docAuthContract.options.address = contractAddress;

    }

    public isReady() {
        return this.bc.ready;
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
        try {
            await this.bc.ready;
            logger.info("addProof() called for id " + uid);
            let hash = DocAuthenticator.getHashOfFile(buffer);   
            logger.info("addProof(" + uid + " , " + hash + " )"); 
            let tx = this.docAuthContract.methods.addProof(uid, hash);
            let gas = await tx.estimateGas();
            logger.info("Estimated gas: " + gas);
            let txObject = {
                gas: gas,
                data: tx.encodeABI(),
                from: this.bc.getAccountAddress(),
                to: this.docAuthContract.options.address
            };
            logger.info("addProof() function sending tx to signAndSendTx() - from: " + txObject.from + " gas: " + txObject.gas + " to: " + txObject.to);
            return this.bc.signAndSendTx(txObject);
        } catch (e) {
            logger.error("Error during addProof() " + e);
            return Promise.reject(e);
        }
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
