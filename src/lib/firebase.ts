import { initializeApp } from 'firebase/app'
import { query, getDocs, getFirestore, collection, where, setDoc, doc, increment, updateDoc, getDoc } from 'firebase/firestore'
import { LIMITS } from './constants'
import { Account, ServiceTypes, Plans } from './types'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const accountCollection = 'accounts'
const usageCollection = 'accounts'


/**
 * Get the API key from the authorization header.
 * 
 * @param request 
 */
export function getApiKey(request: Request) {
  return request.headers.get('authorization')?.replace(/^Bearer\s/, '') as Account['key'] || false
}


/**
 * Get the account from Firestore database.
 * 
 * @param key The API key
 */
export async function getAccount(key: Account['key']) {
  const docSnap = await getDoc(doc(db, accountCollection, key))

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
  const q = query(collection(db, accountCollection), where('domains', 'array-contains', domain))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return false
  }

  const doc = querySnapshot.docs[0]

  return doc.data() as Account
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
  const month = getCurrentMonth()
  const collectionDatePath = `${usageCollection}/${apiKey}/${month}`

  /**
   * Update the usage for the domain
   */
  try {
    await updateDoc(doc(db, collectionDatePath, domain), {
      [type]: increment(1)
    })
  } catch(error) {
    await setDoc(doc(db, collectionDatePath, domain), {
      [type]: 1
    })
  }

  /**
   * Update the account monthly usage total
   */
  await updateDoc(doc(db, usageCollection, apiKey), {
    [`${month}.${type}`]: increment(1)
  })
}


/**
 * Check the account has available credits
 */
export async function usageLimitReached(
  account: Account,
  type: ServiceTypes
) {
  const month = getCurrentMonth()
  const docSnap = await getDoc(doc(db, 'usage', account.key))

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


/**
 * Get the date as a string as formatted in Firestore
 * 
 * Example: `2024-3`
 */
function getCurrentMonth() {
  const date = new Date()
  return `${date.getFullYear()}-${date.getMonth() + 1}`
}


export async function addDomain(domain: string, accountId: string, account: Account) {
  const newData: Account = {
    ...account
  }

  newData.domains = newData.domains || []

  if (newData.domains.indexOf(domain) < 0) {
    newData.domains.push(domain)

    return await setDoc(doc(db, accountCollection, accountId), newData)
  }

  return false
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
  
  await setDoc(doc(db, accountCollection, key), data)

  return key
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
