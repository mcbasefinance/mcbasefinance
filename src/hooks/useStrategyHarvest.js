import { useCallback } from 'react'
import { useSelector } from "react-redux"

import { strategyHarvest } from '../mcbase/utils'

const useStrategyHarvest = (strategyContract) => {

  const address = useSelector((state) => state.authUser.address)

  const handleHarvest = useCallback(
    async () => {
      const txHash = await strategyHarvest(
        strategyContract,
        address
      )
      console.log(txHash)
    },
    [address, strategyContract],
  )

  return { onHarvest: handleHarvest }
}

export default useStrategyHarvest
