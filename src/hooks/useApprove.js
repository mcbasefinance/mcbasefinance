import { useCallback } from 'react'
import { useSelector } from "react-redux"

import { approve } from '../mcbase/utils'

const useApprove = (tokenContract, targetContract) => {
  const address = useSelector((state) => state.authUser.address)

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(tokenContract, targetContract, address)
      return tx
    } catch (e) {
      return false
    }
  }, [address, tokenContract, targetContract])

  return { onApprove: handleApprove }
}

export default useApprove
