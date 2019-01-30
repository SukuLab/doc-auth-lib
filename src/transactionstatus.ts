import { TransactionReceipt, Contract } from "web3/types";


type TransactionStatus = {
    error : Error,  // can happen anytime
    pubTxHash : string, // 1. step of dual connection payment
    pubReceipt : TransactionReceipt, // 2. step of dual connection payment
    privTxHash : string, // 3. step of dual connection payment
    privReceipt : TransactionReceipt, // 4. step of dual connection payment
    privContract : Contract // 5. step of dual connection payment
  }

export default TransactionStatus;