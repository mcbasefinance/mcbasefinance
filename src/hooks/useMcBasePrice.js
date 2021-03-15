import { useCallback, useEffect, useState } from 'react';

import BigNumber from 'bignumber.js';

import { getReserves } from '../mcbase/utils';
import { mcbaseBnbLPTokenContract } from '../mcbase/contracts';
import useBlock from './useBlock';
import useWBNBPrice from './useWBNBPrice';

const useMcBasePrice = () => {
  const [price, setPrice] = useState(new BigNumber(0))
  const block = useBlock()
  const bnbPrice = useWBNBPrice()

  const fetchMcBasePrice = useCallback(async () => {
    try {
      const { reserve0, reserve1 } = await getReserves(mcbaseBnbLPTokenContract.contract)
      if (!new BigNumber(reserve1).eq(new BigNumber(0))) {
        const newPrice = new BigNumber(reserve0).div(new BigNumber(reserve1))
        if (!newPrice.eq(price)) {
          setPrice(newPrice.times(bnbPrice))
        }
      }
    } catch (e) {
      console.log("useMcBasePrice :>>", e);
    }
  }, [mcbaseBnbLPTokenContract,bnbPrice]);

  useEffect(() => {
    if (mcbaseBnbLPTokenContract) {
      fetchMcBasePrice()
    }
  }, [mcbaseBnbLPTokenContract, setPrice, block, bnbPrice]);

  return price;
}

export default useMcBasePrice;
