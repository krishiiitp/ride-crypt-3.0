const ethers = require("ethers");
const RPC =
  "https://arbitrum-sepolia.infura.io/v3/b5011aeeab5f40ce986152f75527dcaf";
const contractAddress = "0xC9CF1F17109EDc0168088B509A166B854e38019d";
const { abi } = require("abi.js");

/**
 * Function for Metamask connection
 * @returns an object containing the contract instance, the provider and the wallet address
 */
async function getWeb3() {
  try {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        abi,
        signer
      );
      const address = await signer.getAddress();
      return { contractInstance, provider, address };
    } else {
      alert("No metamask found!!");
    }
  } catch (err) {
    return err;
  }
}

const web3Object = await getWeb3();
const rpcProvider = new ethers.JsonRpcProvider(RPC);
export const contractInstance = web3Object.contractInstance;
export const walletAddress = web3Object.walletAddress;
export const provider = web3Object.provider;

// Retrieval and Event Listeners

/**
 * Function that returns the logs for this event signature from the chain
 * @param {*} eventSignature
 * @param {*} topics
 * @returns
 */
export async function getLogs(eventSignature, topics = [], fromBlock) {
  const logs = await rpcProvider.getLogs({
    address: contractAddress,
    fromBlock: fromBlock,
    toBlock: await rpcProvider.getBlockNumber(),
    topics: [ethers.id(eventSignature), ...topics],
    removed: false,
  });
  return logs;
}

// Functions to create a proposal and withdraw funds

export async function floatProposal(fare, latitute, longtitude) {
  try {
    const fareInWei = ethers.parseUnits(fare.toString(), "wei");
    const tx = await contractInstance.floatProposal(
      fareInWei,
      latitute,
      longtitude,
      {
        value: fareInWei,
      }
    );
    await tx.wait();
  } catch (err) {
    return err;
  }
}

/**
 * Creates the
 * @param {*} driverAddress The driver address, sourced from the acceptance
 * @param {*} fare The ride's fare
 * @returns
 */
export async function createProposal(driverAddress, fare) {
  try {
    const fareInWei = ethers.parseUnits(fare.toString(), "wei");
    const tx = await contractInstance.createProposal(driverAddress, fareInWei, {
      value: fareInWei,
    });
    await tx.wait();
  } catch (err) {
    return err;
  }
}

export async function withdrawFunds(proposalID) {
  try {
    const tx = await contractInstance.withdrawFunds(proposalID);
    await tx.wait();
  } catch (err) {
    return err;
  }
}

// Function to authorize ride completion
export async function markFulfilment(proposalID) {
  try {
    const tx = await contractInstance.markFulfilment(proposalID);
    await tx.wait();
  } catch (err) {
    return err;
  }
}
// Create and delete users
export async function createUser() {
  try {
    const tx = await contractInstance.createUser();
    await tx.wait();
  } catch (err) {
    return err;
  }
}
export async function deleteUser() {
  try {
    const tx = await contractInstance.deleteUser();
    await tx.wait();
  } catch (err) {
    return err;
  }
}
// Functions to retrieve proposal data, gasless in nature

export async function getProposalUser(proposalID) {
  try {
    const tx = await contractInstance.getProposalUser(proposalID);
    return tx;
  } catch (err) {
    return err;
  }
}
export async function getProposalDriver(proposalID) {
  try {
    const tx = await contractInstance.getProposalDriver(proposalID);
    return tx;
  } catch (err) {
    return err;
  }
}
export async function getProposalFare(proposalID) {
  try {
    const tx = await contractInstance.getProposalFare(proposalID);
    return tx;
  } catch (err) {
    return err;
  }
}
export async function checkFulfilment(proposalID) {
  try {
    const tx = await contractInstance.checkFulfilment(proposalID);
    return tx;
  } catch (err) {
    return err;
  }
}

// Functions to retrieve user data, gasless in nature

export async function getUserRidesAvailed(proposalID) {
  try {
    const tx = await contractInstance.getUserRidesAvailed();
    return tx;
  } catch (err) {
    return err;
  }
}
export async function getUserRidesPerformed(proposalID) {
  try {
    const tx = await contractInstance.getUserRidesPerformed();
    return tx;
  } catch (err) {
    return err;
  }
}
export async function getUserIsActive(proposalID) {
  try {
    const tx = await contractInstance.getUserIsActive();
    return tx;
  } catch (err) {
    return err;
  }
}
