import { useCallback, useEffect, useState } from 'react'
import { useSelector } from "react-redux"

import BigNumber from 'bignumber.js'

import { checkAllowance } from '../mcbase/utils'

const useAllowance = (tokenContract, targetContract) => {
  const address = useSelector((state) => state.authUser.address)
  const [allowance, setAllowance] = useState(new BigNumber(0))

  const fetchAllowance = useCallback(async () => {
    const allowance = await checkAllowance(
      tokenContract,
      address,
      targetContract.options.address,
    )
    setAllowance(new BigNumber(allowance))
  }, [address, tokenContract, targetContract])

  useEffect(() => {
    if (address && tokenContract && targetContract) {
      fetchAllowance()
    }
    let refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [address, tokenContract, targetContract])

  return allowance
}

export default useAllowance
