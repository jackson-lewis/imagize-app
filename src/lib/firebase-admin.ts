import { FirebaseOptions, initializeApp } from 'firebase/app'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'

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
export async function updatePrice(productId: string, priceId: string, price: number, billed: 'monthly' | 'yearly') {
  await updateDoc(doc(db, 'plans', productId), {
    [`price.${billed}`]: {
      id: priceId,
      amount: price
    }
  })
}


/**
 * Update a plan
 */
export async function updatePlan(productId: string, data: any) {
  await updateDoc(doc(db, 'plans', productId), data)
}
