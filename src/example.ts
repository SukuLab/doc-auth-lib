import DocAuthenicator from './doc-authenticator';
import { logger } from './log';
import deployDocAuth from './deploydocauthenticator';

const nodeUrl = "HTTP://127.0.0.1:7545";
const privateKey = "e7507d7e7789fbf1a1b63c783c88727b1a9655ac2c66de59281ddd96b59d2af9";

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

}).catch( e => console.log(e));


