/* eslint-disable quote-props */
/* eslint-disable max-len */
const { web3 } = require('./web3');
const ERC20Abi = require('./abis/ERC20.json');
const mcbaseTokenContractAbi = require('./abis/MCBASEContract.json');
const PancakeLPTokenContractAbi = require('./abis/PancakeLPContract.json');
const mcbaseGeyserContractAbi = require('./abis/MCBASEGeyserContract.json');
const mcbaseVenusVaultContractAbi = require('./abis/McBaseVenusVault.json');
const mcbaseVenusStrategyContractAbi = require('./abis/McBaseVenusStrategy.json');
const mcbaseVaultV4ContractAbi = require('./abis/McBaseVaultV4.json');
const mcbaseAutoStrategyAbi = require('./abis/McBaseAutoStrategy.json');
const config = require('../config');
const networkId = config.networkId;
const {
  contractAddresses,
  supportedVaults
} = require('./constants');


const mcbaseTokenContractAddress = contractAddresses['mcbaseToken'][networkId];
const mcbaseTokenAbiContract = new web3.eth.Contract(mcbaseTokenContractAbi, mcbaseTokenContractAddress);

const mcbaseBnbLPTokenContractAddress = contractAddresses['mcbaseBnbLPToken'][networkId];
const mcbaseBnbLPTokenAbiContract = new web3.eth.Contract(PancakeLPTokenContractAbi, mcbaseBnbLPTokenContractAddress);

const mcbaseBusdLPTokenContractAddress = contractAddresses['mcbaseBusdLPToken'][networkId];
const mcbaseBusdLPTokenAbiContract = new web3.eth.Contract(PancakeLPTokenContractAbi, mcbaseBusdLPTokenContractAddress);

const mcbaseCakeLPTokenContractAddress = contractAddresses['mcbaseCakeLPToken'][networkId];
const mcbaseCakeLPTokenAbiContract = new web3.eth.Contract(PancakeLPTokenContractAbi, mcbaseCakeLPTokenContractAddress);

const mcbaseShareboxGeyserContractAddress = contractAddresses['mcbaseShareboxGeyser'][networkId];
const mcbaseShareboxGeyserAbiContract = new web3.eth.Contract(mcbaseGeyserContractAbi, mcbaseShareboxGeyserContractAddress);

const mcbaseDollarGeyserContractAddress = contractAddresses['mcbaseDollarGeyser'][networkId];
const mcbaseDollarGeyserAbiContract = new web3.eth.Contract(mcbaseGeyserContractAbi, mcbaseDollarGeyserContractAddress);

const mcbaseFlurryGeyserContractAddress = contractAddresses['mcbaseFlurryGeyser'][networkId];
const mcbaseFlurryGeyserAbiContract = new web3.eth.Contract(mcbaseGeyserContractAbi, mcbaseFlurryGeyserContractAddress);

const mcbaseFranchiseGeyserContractAddress = contractAddresses['mcbaseFranchiseGeyser'][networkId];
const mcbaseFranchiseGeyserAbiContract = new web3.eth.Contract(mcbaseGeyserContractAbi, mcbaseFranchiseGeyserContractAddress);

const bnbBusdLPTokenContractAddress = contractAddresses['bnbBusdLPToken'][networkId];
const bnbBusdLPTokenAbiContract = new web3.eth.Contract(PancakeLPTokenContractAbi, bnbBusdLPTokenContractAddress);

const vaultContracts = supportedVaults.map((pool) =>
  Object.assign(pool, {
    tokenAddresses: pool.tokenAddresses[networkId],
    tokenContract: new web3.eth.Contract(ERC20Abi, pool.tokenAddresses[networkId]),
    lpContract: new web3.eth.Contract(PancakeLPTokenContractAbi, pool.lpAddresses[networkId]),
    vaultContract: pool.strategyType == 'venus' ? new web3.eth.Contract(mcbaseVenusVaultContractAbi, pool.vaultAddresses[networkId]) : new web3.eth.Contract(mcbaseVaultV4ContractAbi, pool.vaultAddresses[networkId]),
    strategyContract: pool.strategyType == 'venus' ? new web3.eth.Contract(mcbaseVenusStrategyContractAbi, pool.strategyAddresses[networkId]) : new web3.eth.Contract(mcbaseAutoStrategyAbi, pool.strategyAddresses[networkId]),
  }),
)


module.exports = {
  mcbaseTokenContract: {
    address: mcbaseTokenContractAddress,
    contract: mcbaseTokenAbiContract
  },
  mcbaseBnbLPTokenContract: {
    address: mcbaseBnbLPTokenContractAddress,
    contract: mcbaseBnbLPTokenAbiContract
  },
  mcbaseBusdLPTokenContract: {
    address: mcbaseBusdLPTokenContractAddress,
    contract: mcbaseBusdLPTokenAbiContract
  },
  mcbaseCakeLPTokenContract: {
    address: mcbaseCakeLPTokenContractAddress,
    contract: mcbaseCakeLPTokenAbiContract
  },
  mcbaseShareboxGeyserContract: {
    address: mcbaseShareboxGeyserContractAddress,
    contract: mcbaseShareboxGeyserAbiContract
  },
  mcbaseDollarGeyserContract: {
    address: mcbaseDollarGeyserContractAddress,
    contract: mcbaseDollarGeyserAbiContract
  },
  mcbaseFlurryGeyserContract: {
    address: mcbaseFlurryGeyserContractAddress,
    contract: mcbaseFlurryGeyserAbiContract
  },
  mcbaseFranchiseGeyserContract: {
    address: mcbaseFranchiseGeyserContractAddress,
    contract: mcbaseFranchiseGeyserAbiContract
  },
  bnbBusdLPTokenContract: {
    address: bnbBusdLPTokenContractAddress,
    contract: bnbBusdLPTokenAbiContract
  },
  vaults: vaultContracts,
};

