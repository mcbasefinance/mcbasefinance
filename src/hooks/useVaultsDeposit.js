import { useCallback } from 'react'
import { useSelector } from "react-redux"

import { vaultsDeposit } from '../mcbase/utils'

const useVaultsDeposit = (vaultContract) => {
  const address = useSelector((state) => state.authUser.address)

  const handleDeposit = useCallback(
    async (amount, isAll) => {
      const txHash = await vaultsDeposit(
        vaultContract,
        amount,
        address,
        isAll,
      )
      console.log(txHash)
    },
    [address, vaultContract],
  )

  return { onDeposit: handleDeposit }
}

export default useVaultsDeposit
