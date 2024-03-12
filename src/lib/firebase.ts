import { initializeApp } from 'firebase/app'
import { query, getDocs, getFirestore, collection, where, setDoc, doc, addDoc, DocumentData } from 'firebase/firestore'
import { FREE_PLAN_CREDIT_LIMIT } from './constants'

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
 * @param {Request} request 
 */
export function getApiKey(request: Request) {
  return request.headers.get('authorization')?.replace(/^Bearer\s/, '')
}


/**
 * Get the account from Firestore database.
 * 
 * @param {string} key
 */
export async function getAccount(key: string) {
  const q = query(collection(db, collectionName), where('key', '==', key))
  const querySnapshot = await getDocs(q)

  if ( querySnapshot.empty ) {
    return false
  }

  const doc = querySnapshot.docs[0]

  return {
    id: doc.id,
    data: doc.data()
  }
}


/**
 * Get an account by domain.
 * 
 * @param {string} domain 
 */
export async function getAccountByDomain(domain: string) {
  console.log(domain)
  const q = query(collection(db, collectionName), where('domains', 'array-contains', domain))
  const querySnapshot = await getDocs(q)

  if ( querySnapshot.empty ) {
    return false
  }

  const doc = querySnapshot.docs[0]

  return {
    id: doc.id,
    data: doc.data()
  }
}


/**
 * Increment the credit usage by 1.
 * 
 * @param {string} id 
 * @param {DocumentData} account 
 */
export async function incrementCredit(id: string, account: DocumentData) {
  const newData = {
    ...account
  }

  newData.creditsUsed++

  await setDoc(doc(db, collectionName, id), newData)

  return true
}


/**
 * Check the account is valid to optimize.
 * 
 * @param account 
 */
export function accountLimitReached({ data }: DocumentData) {
  if (data.plan === 'pro') {
    return false
  }

  if (data.creditsUsed < FREE_PLAN_CREDIT_LIMIT) {
    return false
  }

  return true
}
