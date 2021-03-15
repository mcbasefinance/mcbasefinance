require('dotenv').config();

const networkId = process.env.REACT_APP_NETWORK_ID;
const web3Provider = networkId === '56' ? process.env.REACT_APP_MAIN_WEB3_PROVIDER : process.env.REACT_APP_TEST_WEB3_PROVIDER;

const {
  contractAddresses
} = require('../mcbase/constants');

const config = {
  web3Provider: web3Provider,
  contractOwner: {
    mcbaseTimelockAddress: contractAddresses['timelockContract'][networkId],
    shareboxRewardPool: contractAddresses['shareboxRewardPool'][networkId],
    dollarRewardPool: contractAddresses['dollarRewardPool'][networkId],
    flurryRewardPool: contractAddresses['flurryRewardPool'][networkId],
    mcbaseDeployerAddress: contractAddresses['deployer'][networkId],
  },
  beefyApyUrl: process.env.REACT_APP_BEEFY_APY_URL,
  decimals: 18,
  networkId: networkId
};

module.exports = config;
