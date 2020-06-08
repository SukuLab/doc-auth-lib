const docAuthContractJson = require('../blockchain/build/contracts/Docauth');
import NodeManager from '@suku/suku-ethereum-node-api-client-lib';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core/types';

let logger = require('@suku/suku-logging')(require('../package.json'));
const web3 = new Web3(new Web3.providers.HttpProvider(''));

export default async function deployDocAuthenticator(bcNodeUrl : string) : Promise<TransactionReceipt> {
    console.log("Deploying doc authenticator to NodeUrl " + bcNodeUrl);
    let nodemanager = new NodeManager(bcNodeUrl);
    let databaseSyncContract = new web3.eth.Contract(docAuthContractJson.abi);
    let deployTx : any = databaseSyncContract.deploy({
        data: docAuthContractJson.bytecode,
        arguments: []
    });
    let tx : any = {
        data: deployTx.encodeABI(),
        value : 0
    };
    let response = await nodemanager.sendTx(tx);
    logger.info("Response from NodeManager " + response);
    let finalReceipt = await nodemanager.waitForTx(response)
    return finalReceipt;
}
