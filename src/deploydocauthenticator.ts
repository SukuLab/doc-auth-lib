import NodeManager from './nodemanager';
import { TransactionReceipt } from 'web3-core/types';
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
    let txReceipt = await nodemanager.signAndSendTx(tx);
    console.log("Successfully deployed Doc Auth contract. Address: " + txReceipt.contractAddress);
    return txReceipt;
}
