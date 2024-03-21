import { initializeApp } from 'firebase/app'
import { query, getDocs, getFirestore, collection, where, setDoc, doc, increment, updateDoc } from 'firebase/firestore'
import { FREE_PLAN_CREDIT_LIMIT } from './constants'
import { Account, CreditTypes } from './types'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const collectionName = 'accounts'


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
export async function getAccount(key: string) {
  const q = query(collection(db, collectionName), where('key', '==', key))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return false
  }

  const doc = querySnapshot.docs[0]

  return {
    id: doc.id,
    data: doc.data() as Account
  }
}


/**
 * Get an account by domain.
 * 
 * @param domain The hostname to match account by
 */
export async function getAccountByDomain(domain: string) {
  const q = query(collection(db, collectionName), where('domains', 'array-contains', domain))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return false
  }

  const doc = querySnapshot.docs[0]

  return {
    id: doc.id,
    data: doc.data() as Account
  }
}


/**
 * Increment the credit usage by 1.
 * 
 * @param id 
 * @param account 
 */
export async function incrementCredit(type: CreditTypes, id: string, account: Account) {
  const newData: Account = {
    ...account
  }

  newData[`${type}Credits`]++

  await setDoc(doc(db, collectionName, id), newData)

  return true
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
  type: CreditTypes
) {
  const date = new Date()
  const collectionPath = `${collectionName}/${apiKey}/${domain}`
  const docName = `${date.getFullYear()}-${date.getMonth() + 1}`

  try {
    await updateDoc(doc(db, collectionPath, docName), {
      [type]: increment(1)
    })
  } catch(error) {
    await setDoc(doc(db, collectionPath, docName), {
      [type]: 1
    })
  }
}


/**
 * Check the account is valid to optimize.
 * 
 * @param account 
 */
export function accountLimitReached({ data }: {
  data: Account
}, type: CreditTypes) {
  if (data.plan === 'pro') {
    return false
  }

  if (data[`${type}Credits`] < FREE_PLAN_CREDIT_LIMIT) {
    return false
  }

  return true
}


export async function addDomain(domain: string, accountId: string, account: Account) {
  const newData: Account = {
    ...account
  }

  newData.domains = newData.domains || []

  if (newData.domains.indexOf(domain) < 0) {
    newData.domains.push(domain)

    return await setDoc(doc(db, collectionName, accountId), newData)
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
  
  await setDoc(doc(db, collectionName, key), data)

  return key
}


function generateKey(): Account['key'] {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 18; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return `i_${result}`
}
