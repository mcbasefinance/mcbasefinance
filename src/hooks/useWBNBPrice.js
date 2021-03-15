import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'

import { bnbBusdLPTokenContract } from '../mcbase/contracts';
import { getReserves } from '../mcbase/utils';
import useBlock from './useBlock';

const useWBNBPrice = () => {
  const [price, setPrice] = useState(new BigNumber(0))
  const block = useBlock()

  const fetchWBNBPrice = useCallback(async () => {
    try {
      const { reserve0, reserve1 } = await getReserves(bnbBusdLPTokenContract.contract);
      if (!new BigNumber(reserve0).eq(new BigNumber(0))) {
        const newPrice = new BigNumber(reserve1).div(new BigNumber(reserve0))
        if (!newPrice.isEqualTo(price)) {
          setPrice(newPrice)
        }
      }
    } catch (e) { console.log("useWBNBPrice :>>", e); }
  }, [bnbBusdLPTokenContract]);

  useEffect(() => {
    if (bnbBusdLPTokenContract) {
      fetchWBNBPrice()
    }
  }, [bnbBusdLPTokenContract, setPrice, block]);

  return price;
}

export default useWBNBPrice
