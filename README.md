# SUKU Doc Authenticator Lib

## Contract Deployment
The Doc Authenticator requires a contract that needs to be deployed to the blockchain. It comes with a deployment helper.
```
import DocAuthenicator from './doc-authenticator';

const nodeUrl = "HTTP://xyz";
const privateKey = "abc";

deployDocAuth(nodeUrl,privateKey)
.then( async receipt => {
    logger.info("Contract deployed. Contract address: " + receipt.contractAddress);
});

 ```

 ## Usage as a library
After contract deployment it can be used as a library.

### Adding a Proof

```
let docauth = new DocAuthenicator(
        nodeUrl, // nodeUrl
        receipt.contractAddress, // contractAddress
        privateKey // private key that is used for signing
    );

let txReceipt = await docauth.addProof(fileBuffer, uid);
```

### Reading a Proof
```
let docProof = docauth.readProof(buffer);
```


