# SUKU Doc Authenticator Lib

## Usage as a library
The document authenticator ships as an npm package. It can be used as a library but requires the document authenticator smart contract to be deployed to the blockchain that the doc-auth-lib is interacting with.

## NPM Install
To install the document authenticator in your NodeJS project, one can use the official [SUKU NPM Repo](https://www.npmjs.com/settings/suku/packages) (access required) or a git based install.

If you have access to the official NPM repo, you the following command to install the library.
`npm i --save @suku/doc-auth-lib`

If you don't have access to the official NPM repo, you can still install the document authenticator from github. You will need to create a personal access token for the git command line. Please see [this guide](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/). Use the following command:
`npm i --save https://{your-github-token}@github.com/SukuLab/doc-auth-lib`

## Prep: Contract Deployment
The Doc Authenticator requires a contract that needs to be deployed to the blockchain. If the contract has already been deployed to your network, please skip this section.

If you still need to deploy the contract, you can deploy it manually or use our deploymenty script. 

### Manual Deployment
To deploy the contract manually, copy the smart contract code from `./blockchain/contracts/Docauth.sol`. Use [Remix](https://remix.ethereum.org/) and MetaMask to deploy the contract to your network. Connect remix to the network of your choice. We recommend [Ganache](https://truffleframework.com/ganache) for test purposes.

### Automatic Deployment
The document authenticator comes with a helper script that allows for flexible deployment.

1. Import the deployment script from the library
2. Use the `deployDocAuth(nodeUrl, privateKey)` function to deploy the smart contract to your blockchain.
```
import deployDocAuth from '@suku/doc-auth-lib/dist/deploydocauthenticator';

const nodeUrl = "HTTP://xyz";
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
        nodeUrl, // nodeUrl
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
        nodeUrl, // nodeUrl
        receipt.contractAddress, // contractAddress
        privateKey // private key that is used for signing
    );

let docProof = docauth.readProof(buffer);
```



