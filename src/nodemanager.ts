import Web3 from 'web3';
import { logger } from './log';
import { Transaction, TransactionReceipt } from 'web3-core/types';
import { Account } from 'web3-eth-accounts/types';

class NodeManager {

    // Node
    public node :  Web3;

    // Account
    public account : Account;    

    // ready variable to show if node is ready
    public ready : Promise<any>;

    constructor(connectionString : string, privateKey? : string) {

        // Node
        this.node = new Web3(new Web3.providers.HttpProvider(connectionString));        

        // Account
        this.account = { privateKey : "", address : "" };
        this.ready = this.setupAccount(privateKey)
        .catch(e => "Error during setupAccount for privateKey " + privateKey + "Error: " + e);

    }

    public getAccountAddress() : string {
        return this.account.address;
    }

    public getTransaction(txHash : string) : Promise<Transaction> {
        return this.node.eth.getTransaction(txHash)
        .then( (tx : Transaction) => {
            logger.info("Transaction retrieved from chain: "+tx.hash);
            return tx;
        });
    }

    protected getEthereumBalance(address : string) : Promise<string> {
        return this.node.eth.getBalance(address)
        .then( balance => {
            let ether = this.node.utils.fromWei(balance, 'ether');
            logger.debug("getEthereumBalance("+address+") returned "+ether);
            return ether;
        });
    }

    public async checkIfContractExists(contractAddress : string) : Promise<boolean> {
        let code = await this.node.eth.getCode(contractAddress);
        if (code.length > 10) {
            return true;
        } else {
            let msg = "Error: Contract does not exist: " + contractAddress + " on network ID: " + await this.getNetworkId();
            logger.error(msg);
            return false;
        }
    }

    public async signAndSendTx(tx : Transaction) : Promise<TransactionReceipt> {
        logger.info("signAndSendTx() called: tx.from: " + tx.from);
        let signedTx : any = await this.node.eth.accounts.signTransaction(tx, this.account.privateKey);
        return this.node.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on("transactionHash", (txHash : string) => { 
            logger.info("signAndSendTx() TxHash: " + txHash)
         })
        .on('confirmation', (confirmationNumber : number, receipt : TransactionReceipt) => {})
        .on('receipt', (txReceipt : TransactionReceipt) => { 
            logger.info("signAndSendTx success. Tx Address: " + txReceipt.transactionHash);
            return txReceipt;
        })
        .catch(e => {
            logger.error("error during signAndSendTx(): "+e);
            return Promise.reject();
        });
    }

    public isAddress(address : string) : boolean {
        return this.node.utils.isAddress(address);
    }

    public async isConnected() : Promise<boolean> {
        return this.node.eth.net.isListening();
    }

    protected getNonce() : Promise<number> {
        logger.debug("getNonce() called");
        return this.node.eth.getTransactionCount(this.account.address)
        .then( nonce => {
            logger.info("Nonce returned from blockchain: " + nonce);
            return nonce + 1; // Increase nonce to avoid collision 
        }); 
    }

    private async getNetworkId() : Promise<number> {
        await this.ready;
        return this.node.eth.net.getId()
    }

    private async setupAccount(privateKey? : string) {
        logger.info("setupAccount function called on network ID: " + await this.getNetworkId());
        let account : Account;
        if (privateKey == undefined) {
            logger.info("No privateKey specified in config. Trying to access default account...")
            account = await this.getDefaultNodeAccount();
        } else {
            logger.info("Private key specified in config file. Trying to get balance...")
            account = this.getPrivateKeyAccount(privateKey);
        } 
        let ether = await this.getEthereumBalance(account.address)
        .catch(e => console.log("Error getting ETH balance for account " + account.address + " Error: " +e));
        logger.info("Ethereum Account initialized. Address: " + account.address + " Balance: " + ether + "ETH");
        this.account = account;
    }

    private getPrivateKeyAccount(privateKey : string) : Account {
        if (privateKey.substring(0,2) != "0x") {
            privateKey = "0x" + privateKey;
        }
        let account = this.node.eth.accounts.privateKeyToAccount(privateKey);
        return account;
    }

    private async getDefaultNodeAccount() : Promise<Account> {
        let accounts = await this.node.eth.getAccounts();
        logger.info("Address of default account is "+accounts[0]);
        let account : Account = {
            address : accounts[0],
            privateKey : ""
        };
        return account;
    }

}

export default NodeManager;
