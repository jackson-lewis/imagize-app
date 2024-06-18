import { getDocs, collection } from 'firebase/firestore'
import { PlanObject } from '@/lib/types'
import { firestore } from './config'


/**
 * Update the price on a product
 */
export async function getPlans(): Promise<PlanObject[] | null> {
  const snapshot = await getDocs(collection(firestore, 'plans'))

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs.map(doc => {
    return doc.data() as PlanObject
  })
}
