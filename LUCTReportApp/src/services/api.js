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
  limit
} from 'firebase/firestore';
import { db } from '../../config/firebase';

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
        data.push({ id: doc.id, ...doc.data() });
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
        return { data: { [collectionName.slice(0, -1)]: { id: snapshot.id, ...snapshot.data() } } };
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
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
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
      await updateDoc(docRef, {
        ...data,
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