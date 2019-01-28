import NodeManager from './nodemanager';
import { TransactionReceipt } from 'web3/types';
const docAuthContractJson = require('../blockchain/build/contracts/Docauth');

export default async function deployDatabaseSync(bcNodeUrl : string, privateKey : string) : Promise<TransactionReceipt> {
    console.log("Deploying doc authenticator to NodeUrl " + bcNodeUrl);
    let nodemanager = new NodeManager(bcNodeUrl, privateKey);
    await nodemanager.isConnected();
    await nodemanager.accountIsSetup();
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
    privateKey = "0x" + privateKey; // web3 expects privatekey to start with 0x.
    console.log(nodemanager.node.eth.accounts);
    let signedTx : any = await nodemanager.node.eth.accounts.signTransaction(tx, privateKey);
    return nodemanager.node.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on("transactionHash", (txHash : string) => {})
    .on('confirmation', (confirmationNumber : number, receipt : TransactionReceipt) => {})
    .on('receipt', (txReceipt : TransactionReceipt) => { 
        console.log("Contract deployed. Tx Address: " + txReceipt.transactionHash);
        return txReceipt;
    })
    .catch(e => {
        console.log("error during contract deployment:"+e);
        return Promise.reject();
    });
}
