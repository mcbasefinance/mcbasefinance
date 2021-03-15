import { useCallback } from 'react'
import { useSelector } from "react-redux"

import { vaultsWithdraw } from '../mcbase/utils'

const useVaultsWithdraw = (vaultContract) => {
  const address = useSelector((state) => state.authUser.address)

  const handleWithdraw = useCallback(
    async (amount, isAll = false) => {
      const txHash = await vaultsWithdraw(
        vaultContract,
        amount,
        address,
        isAll,
      )
      console.log(txHash)
    },
    [address, vaultContract],
  )

  return { onWithdraw: handleWithdraw }
}

export default useVaultsWithdraw
