'use server'

import { updateAccount } from './firebase'
import { Account } from './types'

export async function updateAccountFormAction(account: Account, defaultState: any, data: FormData) {
  const allowedData = {
    name: data.get('name') as string,
    email: data.get('email') as string
  }

  await updateAccount(account, allowedData)

  return {
    ...defaultState,
    success: true
  }
}
