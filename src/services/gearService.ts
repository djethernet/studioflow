import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db, auth } from '../config/firebase'
import type { LibraryItem } from '../types/StudioItem'
import type { GearFormData } from '../components/AddGearModal'

// Collection references
const GLOBAL_GEAR_COLLECTION = 'gear-global'
const getUserGearCollection = (userId: string) => `users/${userId}/custom-gear`

// Pagination configuration
const PAGE_SIZE = 50

export interface GearQueryOptions {
  searchQuery?: string
  category?: string
  isRack?: boolean
  pageSize?: number
  lastDoc?: QueryDocumentSnapshot
}

export interface GearQueryResult {
  items: LibraryItem[]
  hasMore: boolean
  lastDoc?: QueryDocumentSnapshot
  total?: number
}

// Convert Firestore document to LibraryItem
function firestoreToLibraryItem(doc: QueryDocumentSnapshot): LibraryItem {
  const data = doc.data()
  
  // Handle different timestamp formats safely
  const parseTimestamp = (timestamp: unknown): Date | undefined => {
    if (!timestamp) return undefined
    
    // Firestore Timestamp object
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      return (timestamp as any).toDate()
    }
    
    // Already a Date object
    if (timestamp instanceof Date) {
      return timestamp
    }
    
    // String timestamp
    if (typeof timestamp === 'string') {
      return new Date(timestamp)
    }
    
    return undefined
  }
  
  return {
    id: doc.id,
    name: data.name,
    productModel: data.productModel,
    dimensions: data.dimensions,
    connections: data.connections || [],
    category: data.category,
    icon: data.icon,
    rackUnits: data.rackUnits,
    isRack: data.isRack,
    rackCapacity: data.rackCapacity,
    isOfficial: data.isOfficial || false,
    createdAt: parseTimestamp(data.createdAt),
    updatedAt: parseTimestamp(data.updatedAt),
    tags: data.tags || []
  }
}

// Convert LibraryItem to Firestore data
function libraryItemToFirestore(item: Omit<LibraryItem, 'id'>) {
  return {
    name: item.name,
    productModel: item.productModel,
    dimensions: item.dimensions,
    connections: item.connections,
    category: item.category,
    icon: item.icon,
    rackUnits: item.rackUnits,
    isRack: item.isRack,
    rackCapacity: item.rackCapacity,
    isOfficial: item.isOfficial || false,
    createdAt: item.createdAt ? Timestamp.fromDate(item.createdAt) : Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: item.tags || []
  }
}

/**
 * Load global (official) gear with pagination and filtering
 */
export async function loadGlobalGear(options: GearQueryOptions = {}): Promise<GearQueryResult> {
  try {
    const {
      searchQuery,
      category,
      isRack,
      pageSize = PAGE_SIZE,
      lastDoc
    } = options

    let gearQuery = query(
      collection(db, GLOBAL_GEAR_COLLECTION),
      orderBy('name'),
      limit(pageSize + 1) // Get one extra to check if there are more
    )

    // Apply filters
    if (category) {
      gearQuery = query(gearQuery, where('category', '==', category))
    }

    if (isRack !== undefined) {
      gearQuery = query(gearQuery, where('isRack', '==', isRack))
    }

    // Handle pagination
    if (lastDoc) {
      gearQuery = query(gearQuery, startAfter(lastDoc))
    }

    const snapshot = await getDocs(gearQuery)
    const docs = snapshot.docs
    
    // Check if there are more items
    const hasMore = docs.length > pageSize
    const items = docs.slice(0, pageSize) // Remove the extra item

    let resultItems = items.map(firestoreToLibraryItem)

    // Apply client-side text search if needed (for complex search across multiple fields)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      resultItems = resultItems.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.productModel.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return {
      items: resultItems,
      hasMore,
      lastDoc: hasMore ? items[items.length - 1] : undefined
    }
  } catch (error) {
    console.error('Error loading global gear:', error)
    throw new Error('Failed to load global gear')
  }
}

/**
 * Load user's custom gear with pagination and filtering
 */
export async function loadUserGear(options: GearQueryOptions = {}): Promise<GearQueryResult> {
  try {
    const user = auth.currentUser
    if (!user) {
      return { items: [], hasMore: false }
    }

    const {
      searchQuery,
      category,
      isRack,
      pageSize = PAGE_SIZE,
      lastDoc
    } = options

    let gearQuery = query(
      collection(db, getUserGearCollection(user.uid)),
      orderBy('name'),
      limit(pageSize + 1)
    )

    // Apply filters
    if (category) {
      gearQuery = query(gearQuery, where('category', '==', category))
    }

    if (isRack !== undefined) {
      gearQuery = query(gearQuery, where('isRack', '==', isRack))
    }

    // Handle pagination
    if (lastDoc) {
      gearQuery = query(gearQuery, startAfter(lastDoc))
    }

    const snapshot = await getDocs(gearQuery)
    const docs = snapshot.docs
    
    const hasMore = docs.length > pageSize
    const items = docs.slice(0, pageSize)

    let resultItems = items.map(firestoreToLibraryItem)

    // Apply client-side text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      resultItems = resultItems.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.productModel.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return {
      items: resultItems,
      hasMore,
      lastDoc: hasMore ? items[items.length - 1] : undefined
    }
  } catch (error) {
    console.error('Error loading user gear:', error)
    throw new Error('Failed to load user gear')
  }
}

/**
 * Load combined global and user gear (for main library view)
 */
export async function loadCombinedGear(options: GearQueryOptions = {}): Promise<GearQueryResult> {
  try {
    // Load both global and user gear in parallel
    const [globalResult, userResult] = await Promise.all([
      loadGlobalGear(options),
      loadUserGear(options)
    ])

    // Combine and sort by name
    const combinedItems = [...globalResult.items, ...userResult.items]
      .sort((a, b) => a.name.localeCompare(b.name))

    // For combined results, we'll use a simple approach:
    // - Return the first pageSize items
    // - hasMore is true if either source has more items
    const pageSize = options.pageSize || PAGE_SIZE
    const hasMore = globalResult.hasMore || userResult.hasMore

    return {
      items: combinedItems.slice(0, pageSize),
      hasMore,
      total: combinedItems.length
    }
  } catch (error) {
    console.error('Error loading combined gear:', error)
    throw new Error('Failed to load gear')
  }
}

/**
 * Add custom gear to user's collection
 */
export async function addCustomGear(gearData: GearFormData): Promise<string> {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }

    const newGear: Omit<LibraryItem, 'id'> = {
      name: gearData.name,
      productModel: gearData.productModel,
      dimensions: {
        width: gearData.width,
        height: gearData.height
      },
      connections: gearData.connections,
      category: gearData.category,
      rackUnits: gearData.rackUnits,
      isRack: gearData.isRack,
      rackCapacity: gearData.isRack ? gearData.rackCapacity : undefined,
      isOfficial: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    }

    const docRef = await addDoc(
      collection(db, getUserGearCollection(user.uid)),
      libraryItemToFirestore(newGear)
    )

    return docRef.id
  } catch (error) {
    console.error('Error adding custom gear:', error)
    throw new Error('Failed to add custom gear')
  }
}

/**
 * Update user's custom gear
 */
export async function updateCustomGear(gearId: string, gearData: Partial<GearFormData>): Promise<void> {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now()
    }

    if (gearData.name) updateData.name = gearData.name
    if (gearData.productModel) updateData.productModel = gearData.productModel
    if (gearData.width && gearData.height) {
      updateData.dimensions = { width: gearData.width, height: gearData.height }
    }
    if (gearData.connections) updateData.connections = gearData.connections
    if (gearData.category) updateData.category = gearData.category
    if (gearData.rackUnits !== undefined) updateData.rackUnits = gearData.rackUnits
    if (gearData.isRack !== undefined) {
      updateData.isRack = gearData.isRack
      updateData.rackCapacity = gearData.isRack ? gearData.rackCapacity : null
    }

    await updateDoc(doc(db, getUserGearCollection(user.uid), gearId), updateData)
  } catch (error) {
    console.error('Error updating custom gear:', error)
    throw new Error('Failed to update custom gear')
  }
}

/**
 * Delete user's custom gear
 */
export async function deleteCustomGear(gearId: string): Promise<void> {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }

    await deleteDoc(doc(db, getUserGearCollection(user.uid), gearId))
  } catch (error) {
    console.error('Error deleting custom gear:', error)
    throw new Error('Failed to delete custom gear')
  }
}

/**
 * Get a specific gear item by ID (checks both global and user collections)
 */
export async function getGearById(gearId: string): Promise<LibraryItem | null> {
  try {
    // Try global collection first
    const globalDoc = await getDoc(doc(db, GLOBAL_GEAR_COLLECTION, gearId))
    if (globalDoc.exists()) {
      return firestoreToLibraryItem(globalDoc as QueryDocumentSnapshot)
    }

    // Try user collection if authenticated
    const user = auth.currentUser
    if (user) {
      const userDoc = await getDoc(doc(db, getUserGearCollection(user.uid), gearId))
      if (userDoc.exists()) {
        return firestoreToLibraryItem(userDoc as QueryDocumentSnapshot)
      }
    }

    return null
  } catch (error) {
    console.error('Error getting gear by ID:', error)
    return null
  }
}

/**
 * Initialize global gear collection with sample data (admin function)
 */
export async function initializeGlobalGear(sampleGear: Omit<LibraryItem, 'id'>[]): Promise<void> {
  try {
    const batch = writeBatch(db)
    
    for (const gear of sampleGear) {
      const docRef = doc(collection(db, GLOBAL_GEAR_COLLECTION))
      const gearData = {
        ...libraryItemToFirestore(gear),
        isOfficial: true
      }
      batch.set(docRef, gearData)
    }
    
    await batch.commit()
    console.log('Global gear collection initialized')
  } catch (error) {
    console.error('Error initializing global gear:', error)
    throw new Error('Failed to initialize global gear')
  }
}