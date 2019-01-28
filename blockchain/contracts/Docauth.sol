pragma solidity ^0.5.0;

contract DocAuth {

    struct Proof {
        string id;
        address sender;
        uint timestamp;
    }

    mapping (string => Proof) proofs; 
    address owner;
  
    constructor() public {
        owner = msg.sender;
    }

    function addProof(string memory uid, string memory datahash) public {
        Proof memory newProof = Proof(
            uid,       // object hash
            msg.sender,     // signer address
            now             // current timestamp
        );
        proofs[datahash] = newProof;
    }

    function getProof(string memory datahash) public view returns (string memory id, address sender, uint timestamp) {
        return (
            proofs[datahash].id,
            proofs[datahash].sender,
            proofs[datahash].timestamp
        );
    }
}