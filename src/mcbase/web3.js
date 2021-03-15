import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
const Web3 = require('web3');
const config = require('../config');
const providerUrl = config.web3Provider;
const web3 = new Web3(window.ethereum || providerUrl);

const connector = new WalletConnect({
  bridge: "https://bridge.walletconnect.org", // Required
  qrcodeModal: QRCodeModal,
});

export {
  Web3,
  providerUrl,
  web3,
  connector
};
