import { TransactionReceipt } from "web3-core/types";

type ProofReceipt = {
  docHash: string,
  txReceipt: TransactionReceipt,
}

export default ProofReceipt;