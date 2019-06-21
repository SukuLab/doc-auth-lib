import { TransactionReceipt } from "web3-core/types";
import { Contract } from "web3-eth-contract/types";

type TransactionStatus = {
    error : Error,  // can happen anytime
    predictedTxHash : string, // 1. step of dual connection payment
    txReceipt : TransactionReceipt, // 2. step of dual connection payment
  }

export default TransactionStatus;