import vault_bnb from "../assets/images/vault_bnb.png";
import vault_cake from "../assets/images/vault_cake.png";
import vault_busd from "../assets/images/vault_busd.png";

export const contractAddresses = {
  mcbaseToken: {
    56: '0xcd6de21c28b352e1f7fa2966ac24edca68115159',
  },
  mcbaseBnbLPToken: {
    56: '0x159881ee4e15625412a956172a3f9b88a9405500',
  },
  mcbaseBusdLPToken: {
    56: '0x6e5f67c19d1607749ee2910dd20c50d60ee53856',
  },
  mcbaseCakeLPToken: {
    56: '0x1be6e2f685b91a5c802d3302c5ac6c31103189b9',
  },
  mcbaseShareboxGeyser: {
    56: '0x34ed033a98b67d230b82e4171117ddb22770cbb4',
  },
  mcbaseDollarGeyser: {
    56: '0x8c39a08f1ee9c457913d1d8cbcaa764eea9ef16c',
  },
  mcbaseFlurryGeyser: {
    56: '0x7c1cad6149f97eaea8eadf59f76cbff010a76826',
  },
  mcbaseFranchiseGeyser: {
    56: '0x10c0e943cd956d4ad73c9c46d1b5f1b5f9359a43',
  },
  timelockContract: {
    56: '0x0800eeb35d7bc70e23d15645c225f81a6b824a98',
  },
  shareboxRewardPool: {
    56: '0x70bea3f89f82f1c39ffdcdeac79262d111adc4c9',
  },
  dollarRewardPool: {
    56: '0x9E5165022DB282050665Ea659f1cb8A3c5C14471',
  },
  flurryRewardPool: {
    56: '0xf665df219ef86dc5575810458ff88af9cb2fe44f',
  },
  deployer: {
    56: '0xa741600E5966e7102BB1971BbfE5AFd50F9248F7',
  },
  bnbBusdLPToken: {
    56: '0x1B96B92314C44b159149f7E0303511fB2Fc4774f'
  },
}

export const supportedVaults = [
  {
    tokenAddresses: {
      56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    },
    lpAddresses: {
      56: '0x1B96B92314C44b159149f7E0303511fB2Fc4774f',
    },
    vaultAddresses: {
      56: '0x83803E8d060D13B90e1205cbF8EA0D7A291075EA',
    },
    strategyAddresses: {
      56: '0x301c78D9A6E16c4D1466975bd68DC67D6ef44691',
    },
    symbol: 'WBNB',
    vaultSymbol: 'mcVaultWBNB',
    logo: vault_bnb,
    title: "WBNB Cheeseburger",
    uses: "Uses: Venus",
    strategyType: 'venus',
    order: true,
    apyName: 'venus-bnb'
  },
  {
    tokenAddresses: {
      56: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    },
    lpAddresses: {
      56: '0x1B96B92314C44b159149f7E0303511fB2Fc4774f',
    },
    vaultAddresses: {
      56: '0x63CCFE24f4F1AdD70DBD40b5c55786AF861AD5fD',
    },
    strategyAddresses: {
      56: '0x18561a5E76431D38Fa0D7777C59995Bc58C50301',
    },
    symbol: 'BUSD',
    vaultSymbol: 'mcVaultBUSD',
    logo: vault_busd,
    title: "BUSD Burger",
    uses: "Uses: Venus",
    strategyType: 'venus',
    order: false,
    apyName: 'venus-busd'
  },
  {
    tokenAddresses: {
      56: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    },
    lpAddresses: {
      56: '0x0ed8e0a2d99643e1e65cca22ed4424090b8b7458',
    },
    vaultAddresses: {
      56: '0x01c6Bd9aaDE262f4C015c8244F582BB068ac92e5',
    },
    strategyAddresses: {
      56: '0x9038f97B030B5F5c63e8eEc4a81A65E0d7808A4D',
    },
    symbol: 'CAKE',
    vaultSymbol: 'mcVaultCAKE',
    logo: vault_cake,
    title: "CAKE Milkshake",
    uses: "Uses: Autofarm",
    strategyType: 'autofarm',
    order: true,
    apyName: "auto-cake"
  },
];
