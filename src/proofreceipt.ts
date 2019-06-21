import { TransactionReceipt } from "web3-core/types";

type ProofReceipt = {
  docHash: string,
  predictedTxHash: string,
  confirmedTxReceipt: Promise<TransactionReceipt>
}

export default ProofReceipt;