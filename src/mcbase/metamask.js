const sendTransaction = async (fromAddress, toAddress, encodedABI, gasLimit, successCallBack, errorCallBack, wei = `0x0`) => {
  const web3 = window.web3;
  if (window.ethereum && web3) {
    try {
      let estimationGas = await web3.eth.estimateGas({from: fromAddress, to: toAddress, data: encodedABI});

      const gasPrice = await web3.eth.getGasPrice();
      // gasPrice = '0x${gasPrice.toString(16)';
      const tx = {
        from: fromAddress,
        to: toAddress,
        gas: web3.utils.toHex(parseInt(estimationGas * 1.1)),
        gasPrice: web3.utils.toHex(gasPrice),//`0xAB5D04C00`,
        // chainId: 3,
        data: encodedABI,
        value: wei
      };
      // console.log("params: ==>", tx);

      // const txHash = await window.ethereum.request({
      //   method: 'eth_sendTransaction',
      //   params: [tx],
      // });
      // return txHash;

      web3.eth.sendTransaction(tx)
        .on('transactionHash', (hash) => { console.log('hash: ', hash) })
        .on('receipt', (receipt) => {
          successCallBack();
        })
        .on('error', (err) => {
          errorCallBack(err)
        });

    } catch (err) {
      console.log('err :>> ', err);
      errorCallBack(err);
      return null;
    }
  } else {
    errorCallBack(null);
    return null;
  }
}

export {
  sendTransaction
};