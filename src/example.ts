import DocAuthenicator from './doc-authenticator';
import { logger } from './log';
import deployDocAuth from './deploydocauthenticator';
import fs from 'fs';
import path from 'path';

const nodeUrl = "HTTP://127.0.0.1:7545";
const privateKey = "abdd6b39779c41b015d53fb83d658fe85e65a3b72a8a3e2fadb0030a5dcf1015";

// 0) Helper to deploy doc auth
deployDocAuth(
    nodeUrl,
    privateKey
).then( async receipt => {
    logger.info("Contract deployed. Contract address: " + receipt.contractAddress);
    // 1) Initialize doc auth
    let docauth = new DocAuthenicator(
        nodeUrl, // nodeUrl
        receipt.contractAddress, // contractAddress
        privateKey // private key that is used for signing
    );

    // 2) Add a new file
    let filePath = path.join(__dirname, 'example.ts');
    let buffer : Buffer = fs.readFileSync(filePath); // Do not specify encoding
    await docauth.addProof(buffer, "1");

    // 3) Read a DocProof
    docauth.readProof(buffer);


}).catch( e => console.log(e));


