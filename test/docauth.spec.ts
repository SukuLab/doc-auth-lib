import { expect }  from 'chai';
import 'mocha';
import DocAuthenticator from '../src/doc-authenticator';
import ganache from 'ganache-cli'; 
import deployDocAuth from '../src/deploydocauthenticator';
import fs from 'fs';
import path from 'path';

let privateKey = "adbdb6619b54150986c974a4b4e8408a8833c5bbbe259c7f086a798ca1b88fbd";
let host = "http://127.0.0.1";
let port = 5678
let server = ganache.server({
    accounts : [
        { 
            secretKey : "0x" + privateKey,
            balance : 0xFFFFFFFFFFFFFFFFF
        }
    ]
});
server.listen(port, (err : any, blockchain : any) => { });
let bcNodeUrl = host + ":" + port;

describe('Database', () => {
    let docAuth : DocAuthenticator;    

    before( async () => {
        let contractDeployTxReceiptP = deployDocAuth(bcNodeUrl, privateKey);
        let contractDeployTxReceipt = await contractDeployTxReceiptP;
        docAuth = new DocAuthenticator(bcNodeUrl, contractDeployTxReceipt.contractAddress, privateKey);
    })

    it('should return an object', async () => {
        await docAuth.isReady();
        expect(docAuth).to.be.an('Object');
    });

    describe('DocAuth', () => {

        before( async () => {
            await docAuth.isReady();
        });

        it('should add a proof', async () => {
            let filePath = path.join(__dirname, 'docauth.spec.ts');
            let buffer : Buffer = fs.readFileSync(filePath); // Do not specify encoding
            let txReceipt = await docAuth.addProof(buffer, "1");
            expect(txReceipt.transactionHash).length.to.be.greaterThan(20);
        });

        it('should retrieve a proof', async () => {
            let filePath = path.join(__dirname, 'docauth.spec.ts');
            let buffer : Buffer = fs.readFileSync(filePath); // Do not specify encoding
            let docProof = await docAuth.readProof(buffer);
            expect(docProof.sender).length.to.be.greaterThan(20);
        });

    });
});
