// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PetitionPlatform {
	//EVENTS
	//petition created
	event PetitionCreated(uint256 indexed petitionId, address indexed creator, string title, string description, uint256 goalSignatures);
	//petition signed
	event PetitionSigned(uint256 indexed petitionId, address indexed signer);
	//petition goal reached
	event PetitionGoalReached(uint256 indexed petitionId, address indexed creator, uint256 signatures, uint256 goalSignatures);
	//petition ended
	event PetitionEnded(uint256 indexed petitionId, address indexed creator, uint256 signatures, uint256 goalSignatures);
	//donation made
	event DonationMade(uint256 indexed petitionId, address indexed donor, uint256 amount);
	//found claimed
	event FundsClaimed(uint256 indexed petitionId, address indexed creator, uint256 amount);

	//ERRORS
	//empty string
	error EmptyStringError();
	//petition ended
	error PetitionEndedError();
	//petition in progress
	error PetitionInProgressError();
	//petition not exists
	error PetitionNotExistsError();
	//petition not signed
	error PetitionNotSignedError();
	//petition already signed
	error PetitionAlreadySignedError();
	//invalid amount
	error InvalidAmountError();
	//not petition administrator
	error NotPetitionAdministratorError();
	//no funds to claim
	error NoFundsToClaimError();

	//STATE VARIABLES
	//petition id counter
	uint256 public petitionId;

	//token address
	address public tokenAddress;

	//petition struct
	struct Petition {
		address creator;
		string title;
		string description;
		uint256 signatures;
		uint256 goalSignatures;
		uint256 founds;
		mapping(address => bool) signers;
		bool ended;
	}

	//petition mapping
	mapping(uint256 => Petition) public petitions;

	//users petitions created mapping
	mapping(address => uint256[]) public usersPetitionsCreated;

	//user petitions signed mapping
	mapping(address => uint256[]) public usersPetitionsSigned;

	//MODIFIERS
	//only creator
	modifier onlyCreator(uint256 _petitionId) {
		if (msg.sender != petitions[_petitionId].creator) {
			revert NotPetitionAdministratorError();
		}
		_;
	}

	//only signed
	modifier onlySigned(uint256 _petitionId) {
		if (!petitions[_petitionId].signers[msg.sender]) {
			revert PetitionNotSignedError();
		}
		_;
	}

	//only not signed	
	modifier onlyNotSigned(uint256 _petitionId) {
		if (petitions[_petitionId].signers[msg.sender]) {
			revert PetitionAlreadySignedError();
		}
		_;
	}

	//only petition exists
	modifier onlyPetitionExists(uint256 _petitionId) {
		if (petitions[_petitionId].goalSignatures == 0) {
			revert PetitionNotExistsError();
		}
		_;
	}

	//only petition ended
	modifier onlyPetitionEnded(uint256 _petitionId) {
		if (!petitions[_petitionId].ended) {
			revert PetitionInProgressError();
		}
		_;
	}

	//only petition in rogress
	modifier onlyPetitionInProgress(uint256 _petitionId) {
		if (petitions[_petitionId].ended) {
			revert PetitionEndedError();
		}
		_;
	}

	//CONSTRUCTOR
	constructor(address _tokenAddress) {
		tokenAddress = _tokenAddress;
		petitionId = 0;
	}

	//FUNCTIONS
	//create petition
	function createPetition(string memory _title, string memory _description, uint256 _goalSignatures) public returns (uint256) {
		if (bytes(_title).length == 0 || bytes(_description).length == 0) {
			revert EmptyStringError();
		}
		if (_goalSignatures <= 0) {
			revert InvalidAmountError();
		}
		petitionId++;
		petitions[petitionId].creator = msg.sender;
		petitions[petitionId].title = _title;
		petitions[petitionId].description = _description;
		petitions[petitionId].goalSignatures = _goalSignatures;
		usersPetitionsCreated[msg.sender].push(petitionId);
		emit PetitionCreated(petitionId, msg.sender, _title, _description, _goalSignatures);
		return petitionId; 
	}

	//sign petition
	function signPetition(uint256 _petitionId) public onlyPetitionExists(_petitionId) onlyPetitionInProgress(_petitionId) onlyNotSigned(_petitionId) {
		Petition storage _petition = petitions[_petitionId];
		_petition.signers[msg.sender] = true;
		_petition.signatures++;
		usersPetitionsSigned[msg.sender].push(_petitionId);
		emit PetitionSigned(_petitionId, msg.sender);
		if (_petition.signatures >= _petition.goalSignatures) {
			//_petition.ended = true;
			emit PetitionGoalReached(_petitionId, _petition.creator, _petition.signatures, _petition.goalSignatures);
		}
	}

	//donate to petition
	function donateToPetition(uint256 _petitionId, uint256 _amount) public onlyPetitionExists(_petitionId) onlyPetitionInProgress(_petitionId) onlySigned(_petitionId) {
		if (_amount <= 0) {
			revert InvalidAmountError();
		}
		bool success = IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount);
		require(success, "Transfer failed");
		Petition storage _petition = petitions[_petitionId];
		_petition.founds += _amount;
		emit DonationMade(_petitionId, msg.sender, _amount);
	}

	//claim petition founds
	function claimFunds(uint256 _petitionId) public onlyPetitionExists(_petitionId) onlyPetitionEnded(_petitionId) onlyCreator(_petitionId) {
		if (petitions[_petitionId].founds <= 0) {
			revert NoFundsToClaimError();
		}
		bool success = IERC20(tokenAddress).transfer(msg.sender, petitions[_petitionId].founds);
		require(success, "Transfer failed");
		petitions[_petitionId].founds = 0;
		emit FundsClaimed(_petitionId, msg.sender, petitions[_petitionId].founds);
	}

	//close petition
	function closePetition(uint256 _petitionId) public onlyPetitionExists(_petitionId) onlyCreator(_petitionId) onlyPetitionInProgress(_petitionId) {
		petitions[_petitionId].ended = true;
		emit PetitionEnded(_petitionId, petitions[_petitionId].creator, petitions[_petitionId].signatures, petitions[_petitionId].goalSignatures);
	}

	//GETTERS
	//get max petitions id
	function getMaxPetitionsIds() public view returns (uint256) {
		return petitionId;
	}

	//get petition creator
	function getPetitionCreator(uint256 _petitionId) public view returns (address) {
		return petitions[_petitionId].creator;
	}

	//get petition title
	function getPetitionTitle(uint256 _petitionId) public view returns (string memory) {
		return petitions[_petitionId].title;
	}

	//get petition description
	function getPetitionDescription(uint256 _petitionId) public view returns (string memory) {
		return petitions[_petitionId].description;
	}

	//get petition signatures
	function getPetitionSignatures(uint256 _petitionId) public view returns (uint256) {
		return petitions[_petitionId].signatures;
	}

	//get petition goal signatures
	function getPetitionGoalSignatures(uint256 _petitionId) public view returns (uint256) {
		return petitions[_petitionId].goalSignatures;
	}

	//get petition founds
	function getPetitionFounds(uint256 _petitionId) public view returns (uint256) {
		return petitions[_petitionId].founds;
	}

	//get petition ended
	function getPetitionEnded(uint256 _petitionId) public view returns (bool) {
		return petitions[_petitionId].ended;
	}

	/*//get petition signers
	function getPetitionSigners(uint256 _petitionId) public view returns (address[] memory) {
		
	}*/

	//get user petitions created
	function getUserPetitionsCreated(address _user) public view returns (uint256[] memory) {
		return usersPetitionsCreated[_user];
	}

	//get user petitions signed
	function getUserPetitionsSigned(address _user) public view returns (uint256[] memory) {
		return usersPetitionsSigned[_user];
	}

	//SETTERS
	//set petition goal signatures
	function setPetitionGoalSignatures(uint256 _petitionId, uint256 _goalSignatures) public onlyPetitionExists(_petitionId) onlyCreator(_petitionId) onlyPetitionInProgress(_petitionId) {
		petitions[_petitionId].goalSignatures = _goalSignatures;
	}

	//set petition description
	function setPetitionDescription(uint256 _petitionId, string memory _description) public onlyPetitionExists(_petitionId) onlyCreator(_petitionId) onlyPetitionInProgress(_petitionId) {
		petitions[_petitionId].description = _description;
	}

}