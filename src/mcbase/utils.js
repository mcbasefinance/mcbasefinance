const { web3 } = require('./web3');
const BigNumber = require('bignumber.js');
const ethers = require('ethers');
const config = require('../config');

const defaultDecimal = 18;

const createEthAccount = () => {
  return web3.eth.accounts.create();
};

const getETHBalance = async (address) => {
  const ethBalance = await web3.eth.getBalance(address);
  return ethBalance;
}

const checkBalance = async (address, threshold = 0) => {
  const balance = await getETHBalance(address);
  if (balance <= threshold) {
    throw new Error('Insufficient balance');
  }
  return balance;
}

const callMethod = async (method, args = []) => {
  const result = await method(...args).call();
  return result;
}

const promisify = (promiEvent) => {
  return new Promise((resolve, reject) => {
    promiEvent
      // .on('confirmation', (confirmationNumber, receipt) => { // eslint-disable-line
      //   console.log('confirmation: ' + confirmationNumber);
      // })
      .on('error', (err) => {
        console.log('reject err : ', err);
        return reject(err);
      })
      .once('transactionHash', (hash) => {
        console.log('hash :>> ', hash);
        // return resolve(hash);
      })
      .once('receipt', receipt => { // eslint-disable-line
        console.log('reciept', receipt);
        return resolve(receipt);
      })
    // .then(console.log)
    // .catch(reject);
  })
}

const sendTransaction = async (privateKey, contractAddress, method, args = []) => {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  await checkBalance(account.address);

  const encodedABI = method(...args).encodeABI();
  const gasPrice = await web3.eth.getGasPrice();
  // const gasEstimate = await web3.eth.estimateGas({
  //   from: account.address,
  //   to: contractAddress,
  //   data: encodedABI,
  // });

  const tx = {
    from: account.address,
    to: contractAddress,
    // gas: gasEstimate,
    gas: 4000000,
    gasPrice: gasPrice,
    data: encodedABI,
  };
  const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
  const txHash = await promisify(web3.eth.sendSignedTransaction(signedTx.rawTransaction));

  return txHash;
}

const getNetworkNonce = async (address) => {
  try {
    let nonce = await web3.eth.getTransactionCount(address);
    const pendingTxCount = await new Promise((resolve, reject) => {
      web3.currentProvider.send({
        method: 'txpool_content',
        params: [],
        jsonrpc: '2.0',
        id: new Date().getTime()
      }, (error, response) => {
        if (response && response.error && response.error.code) {
          console.error('signTxData err:', response);
        }
        if (error) {
          reject(error);
        } else
          // Even though the API call didn't error the response can still contain an error message.
          if (response && response.result.pending && response.result.pending[address]) {
            const txnsCount = Object.keys(response.result.pending[address]).length;
            resolve(txnsCount);
          }
        resolve(0);
      });
    });
    // eslint-disable-next-line no-unused-vars
    nonce = new BigNumber(nonce).plus(pendingTxCount).toNumber();
    return nonce;
  } catch (err) {
    return 0;
  }
}

const bnToDec = (bn, decimals = defaultDecimal) => {
  return bn.dividedBy(new BigNumber(10).pow(decimals)).toNumber()
}

const bnDivdedByDecimals = (bn, decimals = defaultDecimal) => {
  return bn.dividedBy(new BigNumber(10).pow(decimals))
}

const bnMultipledByDecimals = (bn, decimals = defaultDecimal) => {
  return bn.multipliedBy(new BigNumber(10).pow(decimals))
}

const decToBn = (dec, decimals = defaultDecimal) => {
  return new BigNumber(dec).multipliedBy(new BigNumber(10).pow(decimals))
}


const getReserves = async (pairContract) => {
  try {
    const { _reserve0, _reserve1, _blockTimestampLast } = await pairContract.methods
      .getReserves()
      .call()
    return { reserve0: _reserve0, reserve1: _reserve1 }
  } catch {
    return { reserve0: '0', reserve1: '0' }
  }
}

const totalStakedFor = async (geyserContract, address) => {
  const result = await callMethod(geyserContract.contract.methods['totalStakedFor'], [address]);
  return bnDivdedByDecimals(new BigNumber(result));
}

const totalStaked = async (geyserContract) => {
  const result = await callMethod(geyserContract.contract.methods['totalStaked'], []);
  return bnDivdedByDecimals(new BigNumber(result));
}

const getUserReward = async (geyserContract, address, rewardToTime) => {
  const result = await callMethod(geyserContract.contract.methods['getUserReward'], [address, rewardToTime]);
  return bnDivdedByDecimals(new BigNumber(result));
}

const getUserFirstStakeTime = async (geyserContract, address) => {
  const result = await callMethod(geyserContract.contract.methods['getUserFirstStakeTime'], [address]);
  return Number(result);
}

const getTotalSecUnlockPriceInUSD = async (geyserContract, mcbasePriceInUSD, currentTime) => {
  let totalSecUnlockPriceInUSD = new BigNumber(0);
  const unlockScheduleCount = await callMethod(geyserContract.contract.methods['unlockScheduleCount'], []);
  for (let index = 0; index < unlockScheduleCount; index++) {
    const result = await callMethod(geyserContract.contract.methods['unlockSchedules'], [index]);
    if (currentTime <= Number(result[3])) {
      totalSecUnlockPriceInUSD = totalSecUnlockPriceInUSD.plus(bnDivdedByDecimals(new BigNumber(result[0]), 24).div(new BigNumber(result[4])).times(mcbasePriceInUSD));
      // console.log(mcbasePriceInUSD.toFormat(2));
      // console.log(bnDivdedByDecimals(new BigNumber(result[0]), 24).toFormat(2));
      // console.log(result[4]);
      // console.log(bnDivdedByDecimals(new BigNumber(result[0]), 24).div(new BigNumber(result[4])).times(mcbasePriceInUSD).toFormat(2));
    }
  }

  return totalSecUnlockPriceInUSD;
}

const checkAllowance = async (tokenContract, owner, spender) => {
  const result = await callMethod(tokenContract.methods['allowance'], [owner, spender]);
  return bnDivdedByDecimals(new BigNumber(result));
}

const getBalance = async (tokenContract, address) => {
  const result = await callMethod(tokenContract.methods['balanceOf'], [address]);
  return bnDivdedByDecimals(new BigNumber(result));
}

const getTotalSupply = async (tokenContract) => {
  const result = await callMethod(tokenContract.methods['totalSupply'], []);
  return bnDivdedByDecimals(new BigNumber(result));
}

const getMcBaseRebaseLag = async (mcbaseTokenContract) => {
  const result = await callMethod(mcbaseTokenContract.contract.methods['_rebaseLag'], []);
  return Number(result / 10);
}

const getMcBaseSupersizeRate = async (mcbaseTokenContract) => {
  const result = await callMethod(mcbaseTokenContract.contract.methods['getSupersizeRate'], []);
  if (result[1] == true)
    return new BigNumber(result[0]);
  return new BigNumber(result[0] * -1);
}

const getMcBasePriceInUSD = async (mcbaseTokenContract) => {
  const result = await callMethod(mcbaseTokenContract.contract.methods['getTokenPriceInUSD'], []);
  return bnDivdedByDecimals(new BigNumber(result), 26);
}

const getMcBaseAveragePriceInUSD = async (mcbaseTokenContract) => {
  const result = await callMethod(mcbaseTokenContract.contract.methods['getTokenAveragePriceInUSD'], []);
  return bnDivdedByDecimals(new BigNumber(result), 26);
}

const getMcBaseEpochCycle = async (mcbaseTokenContract) => {
  const result = await callMethod(mcbaseTokenContract.contract.methods['_epochCycle'], []);
  return Number(result);
}

const getMcBaseLastEpochTime = async (mcbaseTokenContract) => {
  const result = await callMethod(mcbaseTokenContract.contract.methods['_lastEpochTime'], []);
  return Number(result);
}

const getLpPrice = async (lpTokenContract, baseToken, order, bnbPrice, mcbasePrice) => {
  let lpPrice = new BigNumber(0)

  let basePrice = new BigNumber(0)
  if (baseToken === 'WBNB')
    basePrice = bnbPrice
  else if (baseToken === 'MCBASE')
    basePrice = mcbasePrice

  let { reserve0, reserve1 } = await getReserves(lpTokenContract.contract)
  let totalLPPrice = new BigNumber(0)

  if (order == true)
    totalLPPrice = basePrice.times(bnDivdedByDecimals(new BigNumber(reserve0))).times(2)
  else
    totalLPPrice = basePrice.times(bnDivdedByDecimals(new BigNumber(reserve1))).times(2)

  let totalSupply = await getTotalSupply(lpTokenContract.contract)

  if (!totalSupply.eq(new BigNumber(0))) {
    lpPrice = totalLPPrice.div(totalSupply)
  }

  return lpPrice
}

const approve = async (tokenContract, targetContract, account) => {
  return tokenContract.methods
    .approve(targetContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account })
}

const vaultsDeposit = async (vaultContract, amount, account, isAll) => {
  let args = [new BigNumber(amount).times(new BigNumber(10).pow(18)).toString()]
  let method = vaultContract.methods.deposit
  if (isAll) {
    args = []
    method = vaultContract.methods.depositAll
  }
  return method(...args)
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

const vaultsWithdraw = async (vaultContract, amount, account, isAll) => {
  let args = [new BigNumber(amount).times(new BigNumber(10).pow(18)).toString()]
  let method = vaultContract.methods.withdraw
  if (isAll) {
    args = []
    method = vaultContract.methods.withdrawAll
  }
  return method(...args)
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

const strategyHarvest = async (strategyContract, account) => {
  let method = strategyContract.methods.harvest
  return method()
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

const getApyList = async () => {
  return await fetch(config.beefyApyUrl
    , {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  )
    .then(function (response) {
      return response.json();
    }).then(function(myJson) {
      return myJson;
    });
}

export {
  createEthAccount,
  getETHBalance,
  checkBalance,
  callMethod,
  sendTransaction,
  getNetworkNonce,
  bnToDec,
  bnDivdedByDecimals,
  bnMultipledByDecimals,
  decToBn,
  getReserves,
  totalStaked,
  totalStakedFor,
  getUserReward,
  getUserFirstStakeTime,
  getTotalSecUnlockPriceInUSD,
  checkAllowance,
  getBalance,
  getTotalSupply,
  getMcBaseRebaseLag,
  getMcBaseSupersizeRate,
  getMcBasePriceInUSD,
  getMcBaseAveragePriceInUSD,
  getMcBaseEpochCycle,
  getMcBaseLastEpochTime,
  getLpPrice,
  approve,
  vaultsDeposit,
  vaultsWithdraw,
  strategyHarvest,
  getApyList
};
