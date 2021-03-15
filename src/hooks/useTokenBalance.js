import { useCallback, useEffect, useState } from 'react'

import { useSelector } from "react-redux"
import BigNumber from 'bignumber.js'

import { getBalance } from '../mcbase/utils'
import useBlock from './useBlock'

const useTokenBalance = (tokenContract) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const block = useBlock()

  const address = useSelector((state) => state.authUser.address)

  const fetchBalance = useCallback(async () => {
    const balance = await getBalance(tokenContract, address)
    setBalance(new BigNumber(balance))
  }, [address, tokenContract])

  useEffect(() => {
    if (address && tokenContract) {
      fetchBalance()
    }
  }, [address, setBalance, block, tokenContract])

  return balance
}

export default useTokenBalance
