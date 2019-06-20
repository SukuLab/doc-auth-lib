import NodeManager from './nodemanager';
import { TransactionReceipt } from 'web3-core/types';
import { logger } from './log';
const docAuthContractJson = require('../blockchain/build/contracts/Docauth');

export default async function deployDocAuthenticator(bcNodeUrl : string, privateKey : string) : Promise<TransactionReceipt> {
    console.log("Deploying doc authenticator to NodeUrl " + bcNodeUrl);
    let nodemanager = new NodeManager(bcNodeUrl, privateKey);
    await nodemanager.ready;
    console.log("Node connected. Account is setup.");
    let databaseSyncContract = new nodemanager.node.eth.Contract(docAuthContractJson.abi);
    let deployTx : any = databaseSyncContract.deploy({
        data: docAuthContractJson.bytecode,
        arguments: []
    });
    let tx : any = {
        from: nodemanager.getAccountAddress(),
        data: deployTx.encodeABI(),
        gas : await deployTx.estimateGas(),
        value : 0
    };
    let signedTx : any = await nodemanager.node.eth.accounts.signTransaction(tx, nodemanager.account.privateKey);
    return nodemanager.node.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on("transactionHash", (txHash : string) => { 
        logger.info("signAndSendTx() TxHash: " + txHash);
     })
    .on('confirmation', (confirmationNumber : number, receipt : TransactionReceipt) => {})
    .on('receipt', (txReceipt : TransactionReceipt) => { 
        logger.info("signAndSendTx success. Tx Address: " + txReceipt.transactionHash);
    })
    .catch(e => {
        logger.error("error during signAndSendTx(): "+e);
        return Promise.reject();
    });
}
