import { createHash, Hash } from 'crypto';
import DocProof from './docproof';
import ProofReceipt from './proofreceipt'
import Web3 from 'web3';
const docAuthContractJson = require('../blockchain/build/contracts/Docauth');
import NodeManager from '@suku/bc-node-manager-client-lib';
import { Contract } from 'web3-eth-contract/types';
import { Transaction } from 'web3-core/types';

let logger = require('@suku/suku-logging')(require('../package.json'));

const web3 = new Web3(new Web3.providers.HttpProvider(''));

class DocAuthenticator {

    // Node
    private nodeManager : NodeManager;

    // Smart Contracts
    private docAuthContract : Contract;


    constructor(nodeManagerUrl : string, contractAddress : string) {

        // Call constructor of NodeManager with connectionString
        this.nodeManager = new NodeManager(nodeManagerUrl);      
        
        // Smart Contracts
        this.nodeManager.checkIfContractExists(contractAddress);
        this.docAuthContract = new web3.eth.Contract(docAuthContractJson.abi);
        this.docAuthContract.options.address = contractAddress;

    }

    public async readProof(buffer : Buffer) : Promise<DocProof> {
        let hash = DocAuthenticator.getHashOfFile(buffer);  

        // Encode call and send it to NodeManager
        let encodedAbi : string = await this.docAuthContract.methods.getProof(hash).encodeABI();
        let tx : Transaction = {
            data: encodedAbi,
            to: this.docAuthContract.options.address,
        };
        let response = await this.nodeManager.callFunction(tx);
        // Return types of smart contract function "getProof" are string, address, uint256
        let returnedProof = web3.eth.abi.decodeParameters([ 'string', 'address', 'uint256' ], response);

        logger.info("readProof( " + hash + " ) returned " + returnedProof);
        let dProof : DocProof = {
            datahash: hash,
            uid: returnedProof[0],
            sender: returnedProof[1],
            timestamp: returnedProof[2]
        };
        return dProof;
    }

    public async addProof(buffer: Buffer, uid: string): Promise<ProofReceipt> {
        try {
            logger.info("addProof() called for id " + uid);
            let hash = DocAuthenticator.getHashOfFile(buffer);   
            logger.info("addProof(" + uid + " , " + hash + " )"); 
            let tx = this.docAuthContract.methods.addProof(uid, hash);
            let txObject = {
                data: tx.encodeABI(),
                to: this.docAuthContract.options.address
            };

            let predictedTxHash = await this.nodeManager.sendTx(txObject);
            
            let receipt : ProofReceipt = {
                docHash: hash,
                predictedTxHash: predictedTxHash,
                confirmedTxReceipt: this.nodeManager.waitForTx(predictedTxHash)
            }
            return receipt;
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
