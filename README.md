# SUKU Doc Authenticator Lib

 ## Usage as a library
After contract deployment it can be used as a library.

### Adding a Proof

```
let docauth = new DocAuthenicator(
        nodeUrl, // nodeUrl
        receipt.contractAddress, // contractAddress
        privateKey // private key that is used for signing
    );

let proofReceipt = await docauth.addProof(fileBuffer, uid);
let docHash = proofReceipt.docHash;
let txReceipt = proofReceipt.txReceipt;
```

### Reading a Proof
```
let docProof = docauth.readProof(buffer);
```

## Contract Deployment
The Doc Authenticator requires a contract that needs to be deployed to the blockchain. The `./deploydocauthenticator` file allows for flexible contract deployment on any blockchain. 
```
import deployDocAuth from './deploydocauthenticator';

const nodeUrl = "HTTP://xyz";
const privateKey = "abc";

deployDocAuth(nodeUrl,privateKey)
.then( async receipt => {
    logger.info("Contract deployed. Contract address: " + receipt.contractAddress);
});

 ```

