import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'

import useWBNBPrice from './useWBNBPrice'

import {
  getReserves,
  getTotalSupply,
  getApyList
} from '../mcbase/utils'

import useBlock from './useBlock'

const useVaultsTVL = (vaults) => {
  const [totalValues, setTotalValues] = useState([])

  const block = useBlock()
  const wbnbPrice = useWBNBPrice()

  let totalVal = [];

  const fetchTotalValues = useCallback(async () => {
    let apyList = await getApyList()

    for (let i = 0; i < vaults.length; i++) {
      let tokenPrice
      if (vaults[i].symbol == 'BUSD')
        tokenPrice = new BigNumber(1)
      else if (vaults[i].symbol == 'WBNB')
        tokenPrice = wbnbPrice
      else {
        const { reserve0, reserve1 } = await getReserves(vaults[i].lpContract);
        if (vaults[i].order && !new BigNumber(reserve0).eq(new BigNumber(0)))
          tokenPrice = new BigNumber(reserve1).div(new BigNumber(reserve0))
        else if (!vaults[i].order && !new BigNumber(reserve1).eq(new BigNumber(0)))
          tokenPrice = new BigNumber(reserve0).div(new BigNumber(reserve1))
      }

      let tvlAmount = await getTotalSupply(vaults[i].vaultContract)
      let apy = new BigNumber(apyList[vaults[i].apyName]).times(100)

      totalVal[i] = { tvl: tvlAmount.times(tokenPrice), apy: apy, dpy: apy.div(new BigNumber(365)) }
    }

    setTotalValues(totalVal)
  }, [vaults, wbnbPrice, setTotalValues])

  useEffect(() => {
    if (vaults) {
      fetchTotalValues()
    }
  }, [vaults, wbnbPrice, setTotalValues, block])

  return totalValues
}

export default useVaultsTVL
