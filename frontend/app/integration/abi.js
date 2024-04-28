const abi = [
  // Events
  "event ProposalCreated(uint256 indexed proposalId, address indexed user, address indexed driver, uint256 fare)",
  "event ProposalFulfilled(uint256 indexed proposalId, address indexed user, address indexed driver, uint256 fare)",
  "event ProposalFloated(uint256 indexed fare, uint256 indexed latitute, uint256 indexed longtitude)",
  // Proposal Functions
  "function getProposalUser(uint256 _id) public view returns (address)",
  "function getProposalDriver(uint256 _id) public view returns (address)",
  "function getProposalFare(uint256 _id) public view returns (uint256)",
  "function checkFulfilment(uint256 _id) public view returns (bool)",
  "function createProposal(address _user, uint256 _fare, uint256 _latitute, uint256 _longtitude) external",
  "function floatProposal(uint256 _fare) external payable",
  "function withdrawFunds(uint256 _proposalId) external",
  "function floatProposal(uint256 _fare, uint256 _latitute, uint256 _longtitude) external payable",
  // User Functions
  "function createUser() public",
  "function deleteUser() public",
  "function getUserRidesAvailed(address _userAddress) public view returns (uint256[] memory)",
  "function getUserRidesPerformed(address _userAddress) public view returns (uint256[] memory)",
  "function getUserIsActive(address _userAddress) public view returns (bool)",
  // Authorization functions
  "function markFulfilment(uint256 _proposalId) external",
  // Testing only functions
  "function returnBalance() external",
  "function getContractBalance() public view returns (uint256)",
];
export default abi;
