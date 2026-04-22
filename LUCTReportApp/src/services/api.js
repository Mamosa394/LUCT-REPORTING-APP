// src/services/firebaseApi.js
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  Timestamp  // Import Timestamp to check for it
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// Helper function to convert Firestore Timestamps to ISO strings
const convertTimestamps = (data) => {
  if (!data) return data;
  
  // Handle Timestamp objects
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item));
  }
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    // Check for Firestore Timestamp in object form
    if (data.seconds !== undefined && data.nanoseconds !== undefined && data.type === 'firestore/timestamp/1.0') {
      const timestamp = new Timestamp(data.seconds, data.nanoseconds);
      return timestamp.toDate().toISOString();
    }
    
    const converted = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        converted[key] = convertTimestamps(data[key]);
      }
    }
    return converted;
  }
  
  return data;
};

class FirebaseApi {
  // Generic GET collection
  async getCollection(collectionName, params = {}) {
    try {
      let q = collection(db, collectionName);
      
      if (params.where) {
        params.where.forEach(({ field, operator, value }) => {
          q = query(q, where(field, operator, value));
        });
      }
      
      if (params.orderBy) {
        q = query(q, orderBy(params.orderBy, params.order || 'asc'));
      }
      
      if (params.limit) {
        q = query(q, limit(params.limit));
      }
      
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach(doc => {
        const docData = doc.data();
        // Convert all timestamps to ISO strings
        const convertedData = convertTimestamps(docData);
        data.push({ id: doc.id, ...convertedData });
      });
      
      return { data: { [collectionName]: data, total: data.length } };
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      throw error;
    }
  }

  // Generic GET document by ID
  async getDocument(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        const docData = snapshot.data();
        // Convert all timestamps to ISO strings
        const convertedData = convertTimestamps(docData);
        return { data: { [collectionName.slice(0, -1)]: { id: snapshot.id, ...convertedData } } };
      }
      throw new Error('Document not found');
    } catch (error) {
      console.error(`Error fetching document:`, error);
      throw error;
    }
  }

  // Generic POST (create)
  async postDocument(collectionName, data) {
    try {
      // Convert any date strings back to Date objects for Firestore if needed
      const firestoreData = { ...data };
      
      // If you need to convert ISO strings back to Dates for Firestore queries
      // This is optional - Firestore accepts ISO strings as well
      if (firestoreData.createdAt && typeof firestoreData.createdAt === 'string') {
        firestoreData.createdAt = new Date(firestoreData.createdAt);
      }
      if (firestoreData.updatedAt && typeof firestoreData.updatedAt === 'string') {
        firestoreData.updatedAt = new Date(firestoreData.updatedAt);
      }
      
      const docRef = await addDoc(collection(db, collectionName), {
        ...firestoreData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return { data: { id: docRef.id, ...data } };
    } catch (error) {
      console.error(`Error creating document:`, error);
      throw error;
    }
  }

  // Generic PUT (update)
  async updateDocument(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      
      // Convert any date strings back to Date objects for Firestore if needed
      const firestoreData = { ...data };
      if (firestoreData.updatedAt && typeof firestoreData.updatedAt === 'string') {
        firestoreData.updatedAt = new Date(firestoreData.updatedAt);
      }
      
      await updateDoc(docRef, {
        ...firestoreData,
        updatedAt: new Date().toISOString()
      });
      
      return { data: { id, ...data } };
    } catch (error) {
      console.error(`Error updating document:`, error);
      throw error;
    }
  }

  // Generic DELETE
  async deleteDocument(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { data: { id } };
    } catch (error) {
      console.error(`Error deleting document:`, error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    // This will be handled in authSlice with Firebase Auth directly
    return credentials;
  }

  async register(userData) {
    // This will be handled in authSlice with Firebase Auth directly
    return userData;
  }
}

export default new FirebaseApi();