import { cookies } from 'next/headers'
import { Account } from './types'

export async function getAccountData(): Promise<Account | false> {
  const accountKey = cookies().get('accountKey')

  if (!accountKey) {
    return false
  }

  return await fetch('http://localhost:3010/api/accounts', {
    method: 'get',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accountKey.value}`
    }
  })
    .then(res => {
      if (res.status === 400) {
        return false
      }

      return res.json()
    })
}