import { FirebaseOptions, initializeApp } from 'firebase/app'
import { getFirestore, setDoc, doc, updateDoc, getDocs, query, collection } from 'firebase/firestore'
import { PlanObject } from './types'

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)


/**
 * Update the price on a product
 */
export async function getPlans(): Promise<PlanObject[] | null> {
  const snapshot = await getDocs(collection(db, 'plans'))

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs.map(doc => {
    return doc.data() as PlanObject
  })
}
