import Web3 from 'web3';
import { Transaction } from 'web3-core/types';
import { Account } from 'web3-eth-accounts';
import { HttpProvider } from 'web3-providers';
import { logger } from './log';
import { BN } from 'web3-utils';

class NodeManager {

    // Node
    public node :  Web3;

    // Account
    public account : Account;    

    constructor(connectionString : string, privateKey? : string) {

        // Node
        this.node = new Web3(new HttpProvider(connectionString));        

        // Account
        this.account = { privateKey : "", address : "" };
        this.setupAccount(privateKey)
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

    protected getEthereumBalance(address : string) : Promise<string | BN> {
        return this.node.eth.getBalance(address)
        .then( balance => {
            let ether = this.node.utils.fromWei(balance, 'ether');
            logger.debug("getEthereumBalance("+address+") returned "+ether);
            return ether;
        });
    }

    public isAddress(address : string) : boolean {
        return this.node.utils.isAddress(address);
    }

    public async isConnected() : Promise<boolean> {
        return this.node.eth.net.isListening();
    }

    public async accountIsSetup() : Promise<boolean> {
        return (await this.account.privateKey != undefined);
    }

    protected getNonce() : Promise<number> {
        logger.debug("getNonce() called");
        return this.node.eth.getTransactionCount(this.account.address)
        .then( nonce => {
            logger.info("Nonce returned from blockchain: " + nonce);
            return nonce + 1; // Increase nonce to avoid collision 
        }); 
    }

    private async setupAccount(privateKey? : string) {
        logger.debug("setupAccount function called");
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
        this.node.eth.accounts.defaultAccount = this.account.address;
    }

    private getPrivateKeyAccount(privateKey : string) : Account {
        let account = this.node.eth.accounts.privateKeyToAccount("0x" + privateKey);
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
