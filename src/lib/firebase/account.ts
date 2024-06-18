import { query, getDocs, collection, where, setDoc, doc, increment, updateDoc, getDoc } from 'firebase/firestore'
import { LIMITS } from '@/lib/constants'
import { Account, ServiceTypes, Plans, AccountUsage } from '@/lib/types'
import { firestore } from './config'
import { getCurrentDay, getCurrentMonth } from '../helpers'


const accountCollection = 'accounts'
const usageCollection = 'usage'


/**
 * Get the API key from the authorization header.
 * 
 * @param request 
 */
export function getApiKey(request: Request) {
  const cookie = request.headers.get('cookie')
  const secFetchSite = request.headers.get('sec-fetch-site')

  if (cookie && secFetchSite === 'same-origin') {
    const split = cookie.split(';')
    let cookieValue: Account['key'] | false = false
  
    split.forEach(cookie => {
      const [name, value] = cookie.split('=')
  
      if (name.trim() === 'accountKey') {
        cookieValue = value as Account['key']
      }
    })

    return cookieValue
  }
  
  return request.headers.get('authorization')?.replace(/^Bearer\s/, '') as Account['key'] || false
}


/**
 * Get the account from Firestore database.
 * 
 * @param key The API key
 */
export async function getAccount(key: Account['key']) {
  const docSnap = await getDoc(doc(firestore, accountCollection, key))

  if (!docSnap.exists()) {
    return false
  }

  return docSnap.data() as Account
}


/**
 * Get an account by domain.
 * 
 * @param domain The hostname to match account by
 */
export async function getAccountByDomain(domain: string) {
  const q = query(collection(firestore, accountCollection), where('domains', 'array-contains', domain))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return false
  }

  const doc = querySnapshot.docs[0]

  return doc.data() as Account
}


/**
 * Get the account from Firestore database.
 * 
 * @param data The data to create a new account with
 */
export async function createAccount(data: Account) {
  const key = generateKey()

  data.key = key
  data.createDate = new Date()
  
  await setDoc(doc(firestore, accountCollection, key), data)

  return key
}


/**
 * Update an account
 * 
 * @param account 
 * @param data 
 * @returns 
 */
export async function updateAccount(account: Account, data: any) {
  const newData: Account = {
    ...account,
    ...data
  }

  return await setDoc(doc(firestore, accountCollection, account.key), newData)
}



export async function addDomain(domain: string, account: Account) {
  const newData: Account = {
    ...account
  }

  newData.domains = newData.domains || []

  if (newData.domains.indexOf(domain) < 0) {
    newData.domains.push(domain)

    await setDoc(doc(firestore, accountCollection, account.key), newData)
    return true
  }

  return false
}


export async function removeDomain(domain: string, account: Account) {
  const newData: Account = {
    ...account
  }

  const domainIndex = newData.domains?.indexOf(domain) || -1

  if (domainIndex >= 0) {
    newData.domains?.splice(domainIndex, 1)
  }
    
  await setDoc(doc(firestore, accountCollection, account.key), newData)
  
  return true
}


/**
 * Generate an API key for an account.
 * 
 * Keys are 20 characters in length prefixed with `i_`
 */
function generateKey(): Account['key'] {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 18; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return `i_${result}`
}


/**
 * Check if email address is associated to account.
 * 
 * @param email Customer email address
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  const q = query(collection(firestore, accountCollection), where('email', '==', email))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return true
  }

  return false
}


export async function setBillingCycleDate(accountKey: Account['key']) {
  await updateDoc(doc(firestore, accountCollection, accountKey), {
    billingCycle: new Date()
  })
}

export async function setCancelDate(accountKey: Account['key']) {
  await updateDoc(doc(firestore, accountCollection, accountKey), {
    cancelDate: new Date()
  })
}


/**
 * Get the current month usage for an account.
 * 
 * @param key The API key
 */
export async function getAccountUsage(key: Account['key']) {
  const docSnap = await getDoc(doc(firestore, usageCollection, key))

  if (!docSnap.exists()) {
    return false
  }

  return docSnap.data() as AccountUsage
}


/**
 * Log the usage to Firestore database.
 * 
 * @param apiKey The API key
 * @param domain The domain the request was for
 * @param type The action type
 */
export async function logUsage(
  apiKey: Account['key'],
  domain: string,
  type: ServiceTypes
) {
  const [year, month, day] = getCurrentDay().split('-')
  const logRef = doc(firestore, `${usageCollection}/${apiKey}/${year}-${month}`, day)
  const excapedDoamin = domain.replace('.', '_')
  /**
   * Update the usage for the domain
   */
  try {
    await updateDoc(logRef, {
      [`${excapedDoamin}.${type}`]: increment(1)
    })
  } catch(error) {
    await setDoc(logRef, {
      [excapedDoamin]: {
        [type]: 1
      }
    })
  }

  /**
   * Update the account monthly usage total
   */
  await updateDoc(doc(firestore, usageCollection, apiKey), {
    [type]: {
      [year]: {
        [month]: {
          [day]: increment(1)
        }
      }
    }
  })
}


/**
 * Log the usage to Firestore database.
 * 
 * @param apiKey The API key
 * @param domain The domain the request was for
 * @param type The action type
 */
export async function logStats(
  apiKey: Account['key'],
  domain: string,
  orgSize: number,
  optSize: number
) {
  const [year, month, day] = getCurrentDay().split('-')
  const logRef = doc(firestore, `${usageCollection}/${apiKey}/${year}-${month}`, day)
  const excapedDoamin = domain.replace('.', '_')
  /**
   * Update the usage for the domain
   */
  try {
    await updateDoc(logRef, {
      [`${excapedDoamin}.stats.org`]: increment(orgSize),
      [`${excapedDoamin}.stats.opt`]: increment(optSize)
    })

  } catch(error) {
    await setDoc(logRef, {
      [excapedDoamin]: {
        stats: {
          org: orgSize,
          opt: optSize
        }
      }
    })
  }
}


/**
 * Check the account has available credits
 */
export async function usageLimitReached(
  account: Account,
  type: ServiceTypes
) {
  const month = getCurrentMonth()
  const docSnap = await getDoc(doc(firestore, 'usage', account.key))

  if (!docSnap.exists()) {
    return false
  }

  const usageData = docSnap.data()

  if (!usageData?.[month]?.[type]) {
    return false
  }

  const typeUsage = usageData[month][type] || 0

  if (typeUsage < getUsageLimit(account.plan, type)) {
    return false
  }

  return true
}


/**
 * Get the usage limit for the provided plan and service type.
 */
function getUsageLimit(plan: Plans, type: ServiceTypes) {
  return LIMITS[plan][type]
}
