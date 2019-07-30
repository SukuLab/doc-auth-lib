import { expect }  from 'chai';
import 'mocha';
import DocAuthenticator from '../src/doc-authenticator';
import fs from 'fs';
import path from 'path';
import nock from 'nock';
import deployDocAuth from '../src/deploydocauthenticator';

let nodeManagerMockUrl = 'http://suku.world';
let contractAddress = '0x823309726b1cd06c9b0b283ca89cd578102661ca1d1f99b0ed5198d1528901dc';

describe('Database', () => {
    let docAuth : DocAuthenticator;    

    before( async () => {
        docAuth = new DocAuthenticator(nodeManagerMockUrl, contractAddress);
    });

    beforeEach( () => {
        // Mock NodeManager REST API
        nock(nodeManagerMockUrl)
            .post('/sendTx')
            .reply(200, "0x800320c5a1984ccca878559e0adbc10ebcaae68eb09166f480035ba8fd8b5a4e");
        nock(nodeManagerMockUrl)
            .get('/waitForTx/0x800320c5a1984ccca878559e0adbc10ebcaae68eb09166f480035ba8fd8b5a4e')
            .reply(200, {
                transactionHash : "0x800320c5a1984ccca878559e0adbc10ebcaae68eb09166f480035ba8fd8b5a4e",
                contractAddress : "0x800320c5a1984ccca878559e0adbc10ebcaae68eb09166f480035ba8fd8b5a4e"
            });   
        nock(nodeManagerMockUrl)
            .post('/callFunction')
            .reply(200, 
                // mock the encoded smart contract response
                "0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000008a01dd7c61a704f17c4d9d602e1807d21d5eee1000000000000000000000000000000000000000000000000000000005d40929200000000000000000000000000000000000000000000000000000000000000013100000000000000000000000000000000000000000000000000000000000000"
                );   
    })

    it('should return an object', async () => {
        expect(docAuth).to.be.an('Object');
    });

    describe('deployDocAuth', () => {
        it('should deploy the contract', async () => {
            let receipt = await deployDocAuth(nodeManagerMockUrl);
            expect(receipt.contractAddress).length.to.be.greaterThan(20);
        })
    })

    describe('DocAuth', () => {

        it('should add a proof', async () => {
            let filePath = path.join(__dirname, 'docauth.spec.ts');
            let buffer : Buffer = fs.readFileSync(filePath); // Do not specify encoding
            let receipt = await docAuth.addProof(buffer, "1");

            let docHash = receipt.docHash;
            expect(docHash).to.have.lengthOf(64);

            let predictedTxHash = receipt.predictedTxHash;
            expect(predictedTxHash).length.to.be.greaterThan(20);

            let confirmedTxHashP = receipt.confirmedTxReceipt;
            expect(confirmedTxHashP).to.be.a("Promise");

            let confirmedTxHash = await confirmedTxHashP;
            expect(confirmedTxHash.transactionHash).length.to.be.greaterThan(20);
        });

        it('should retrieve a proof', async () => {
            let filePath = path.join(__dirname, 'docauth.spec.ts');
            let buffer : Buffer = fs.readFileSync(filePath); // Do not specify encoding
            let docProof = await docAuth.readProof(buffer);
            expect(docProof.sender).length.to.be.greaterThan(20);
        });

    });
});
