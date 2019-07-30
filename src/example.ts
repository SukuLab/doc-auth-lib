import DocAuthenicator from './doc-authenticator';
import deployDocAuth from './deploydocauthenticator';
import fs from 'fs';
import path from 'path';

let logger = require('@suku/suku-logging')(require('../package.json'));

const nodeManagerUrl = "http://localhost:3000";

// 0) Helper to deploy doc auth
deployDocAuth(nodeManagerUrl).then( async receipt => {
    logger.info("Contract deployed. Contract address: " + receipt.contractAddress);
    // 1) Initialize doc auth
    let docauth = new DocAuthenicator(
        nodeManagerUrl, // nodeUrl
        receipt.contractAddress // contractAddress
    );

    // 2) Add a new file
    let filePath = path.join(__dirname, 'example.ts');
    let buffer : Buffer = fs.readFileSync(filePath); // Do not specify encoding
    let proofReceipt = await docauth.addProof(buffer, "1");
    logger.info("addProof returned: Hash: " + proofReceipt.docHash + " predicted txAddress: " + proofReceipt.predictedTxHash);
    logger.info("Confirmed txHash: " + (await proofReceipt.confirmedTxReceipt).transactionHash);

    // 3) Read a DocProof
    docauth.readProof(buffer);


}).catch( e => console.log(e));


