# SUKU Blockchain Document Authenticator Library

![Node.js CI](https://github.com/SukuLab/doc-auth-lib/workflows/Node.js%20CI/badge.svg)
![Publish NPM Package](https://github.com/SukuLab/doc-auth-lib/workflows/Publish%20NPM%20Package/badge.svg)

This is the SUKU Blockchain Document Authenticator Library. It can be used to write blockchain proofs (signed hashes) of files to the blockchain. It expects a deployed version of the [SUKU Ethereum Node API](https://github.com/SukuLab/suku-ethereum-node-api).

## Usage as a library

> **Note:** Before you start, please make sure that you need a deployed version of [SUKU Ethereum Node API](https://github.com/SukuLab/suku-ethereum-node-api). 

The document authenticator ships as an npm package. It requires the document authenticator smart contract to be deployed to the blockchain. 

This package uses [SUKU Ethereum Node API Client Lib](https://github.com/SukuLab/suku-ethereum-node-api-client-lib) to connect to an instance of [SUKU Ethereum Node API](https://github.com/SukuLab/suku-ethereum-node-api).

## NPM Install
`@suku/doc-auth-lib` is available as an [NPM Package](https://www.npmjs.com/package/@suku/doc-auth-lib).

Use the following command to install the library.
```
npm i --save @suku/doc-auth-lib
```

## Prep: Contract Deployment
The Doc Authenticator requires a contract that needs to be deployed to the blockchain. If the contract has already been deployed to your network, please skip this section.

If you still need to deploy the contract, you can deploy it manually or use our deploymenty script. 

### Manual Deployment
To deploy the contract manually, copy the smart contract code from `./blockchain/contracts/Docauth.sol`. Use [Remix](https://remix.ethereum.org/) and MetaMask to deploy the contract to your network. Connect remix to the network of your choice. We recommend [Ganache](https://truffleframework.com/ganache) for test purposes.

### Automatic Deployment
The document authenticator comes with a helper script that allows for flexible deployment.

1. Import the deployment script from the library
2. Use the `deployDocAuth(nodeUrl, privateKey)` function to deploy the smart contract to your blockchain.
3. As nodeURL use the URL of a running instance of [SUKU Ethereum Node API](https://github.com/SukuLab/suku-ethereum-node-api).
4. As privateKey specify a private key that is able to send transactions on the Ethereum node that your API instance is connected to. Make sure that this private key has sufficient gas to send transactions. 

```
import deployDocAuth from '@suku/doc-auth-lib/dist/deploydocauthenticator';

const nodeUrl = "HTTP://xyz"; // SUKU Ethereum Node API instance
const privateKey = "abc"; 

deployDocAuth(nodeUrl,privateKey)
.then( async receipt => {
    logger.info("Contract deployed. Contract address: " + receipt.contractAddress);
});

 ```

## Importing the library
The import depends on you ECMAScript version. 

For ECMAScript <= ES5 (CommonJS `require()`)
```
const docAuthLibrary = require('@suku/doc-auth-lib');
```

For ECMAScript >= ES6 (import)
```
import DocAuthenicator from '@suku/doc-auth-lib';
```

## Adding a Proof
CommonJS Example:
```
const docAuthLibrary = require('@suku/doc-auth-lib');

let docauth = new docAuthLibrary.default(
        nodeUrl, // SUKU Ethereum Node API instance
        receipt.contractAddress, // contractAddress
        privateKey // private key that is used for signing
    );

let proofReceipt = await docauth.addProof(fileBuffer, uid);
let docHash = proofReceipt.docHash;
let txReceipt = proofReceipt.txReceipt;
```

## Reading a Proof
CommonJS Example:
```
const docAuthLibrary = require('@suku/doc-auth-lib');

let docauth = new docAuthLibrary.default(
        nodeUrl, // SUKU Ethereum Node API instance
        receipt.contractAddress, // contractAddress
        privateKey // private key that is used for signing
    );

let docProof = docauth.readProof(buffer);
```



