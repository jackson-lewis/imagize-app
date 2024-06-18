'use server'

import { AddDomainFormState } from '@/components/dashboard/usage/domains'
import { addDomain, removeDomain, updateAccount } from '@/lib/firebase/account'
import { Account } from './types'

export async function updateAccountFormAction(
  account: Account,
  defaultState: any,
  data: FormData
) {
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


export async function removeDomainAction(
  domain: string,
  account: Account
) {
  await removeDomain(domain, account)

  return {
    success: true
  }
}

export async function addDomainAction(
  account: Account,
  defaultState: AddDomainFormState,
  data: FormData
): Promise<AddDomainFormState> {
  const domain = data.get('domain') as string
  await addDomain(domain, account)

  return {
    success: true,
    domain
  }
}
