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
  setDoc,  // ✅ Added for upsert operations
  orderBy,
  limit,
  Timestamp,
  writeBatch  // ✅ Added for batch operations
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
    if (data.seconds !== undefined && data.nanoseconds !== undefined) {
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
      const firestoreData = { ...data };
      
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

  // ✅ ATTENDANCE METHODS
  
  /**
   * Mark attendance for a student
   * Uses setDoc with merge: true to create or update attendance record
   */
  async markAttendance(attendanceData) {
    try {
      const { 
        courseId, 
        courseCode, 
        courseName, 
        studentId, 
        studentName, 
        date, 
        status,
        lecturerId,
        lecturerName 
      } = attendanceData;
      
      // Create a unique ID for the attendance record
      const attendanceDate = new Date(date).toISOString().split('T')[0];
      const recordId = `${courseId}_${studentId}_${attendanceDate}`;
      
      // Prepare attendance record for Firestore
      const attendanceRecord = {
        id: recordId,
        courseId,
        courseCode,
        courseName,
        studentId,
        studentName,
        date: new Date(date).toISOString(),
        dateString: attendanceDate,
        status: status?.toLowerCase() || 'present',
        markedBy: studentId,
        markedByName: studentName || 'Student',
        markedAt: new Date().toISOString(),
        source: 'student_self',
        lecturerId: lecturerId || null,
        lecturerName: lecturerName || null,
        semester: this.getCurrentSemester(),
        academicYear: this.getAcademicYear(),
        updatedAt: new Date().toISOString()
      };
      
      // Add createdAt only for new records
      const existingRecord = await this.checkAttendanceExists(recordId);
      if (!existingRecord) {
        attendanceRecord.createdAt = new Date().toISOString();
      }
      
      // Save to Firestore using setDoc with merge
      const docRef = doc(db, 'attendance', recordId);
      await setDoc(docRef, attendanceRecord, { merge: true });
      
      console.log('✅ Attendance marked successfully:', attendanceRecord);
      
      return {
        success: true,
        data: {
          record: attendanceRecord,
          message: 'Attendance marked successfully'
        }
      };
    } catch (error) {
      console.error('❌ Error marking attendance:', error);
      throw error;
    }
  }

  /**
   * Mark attendance for multiple students (lecturer bulk marking)
   */
  async markBulkAttendance(attendanceDataArray) {
    try {
      const batch = writeBatch(db);
      const records = [];
      
      attendanceDataArray.forEach(data => {
        const { courseId, studentId, date, status } = data;
        const attendanceDate = new Date(date).toISOString().split('T')[0];
        const recordId = `${courseId}_${studentId}_${attendanceDate}`;
        
        const attendanceRecord = {
          ...data,
          id: recordId,
          dateString: attendanceDate,
          status: status?.toLowerCase(),
          markedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        
        const docRef = doc(db, 'attendance', recordId);
        batch.set(docRef, attendanceRecord, { merge: true });
        records.push(attendanceRecord);
      });
      
      await batch.commit();
      
      return {
        success: true,
        data: {
          records,
          count: records.length,
          message: `${records.length} attendance records marked`
        }
      };
    } catch (error) {
      console.error('❌ Error marking bulk attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance records with filters
   */
  async getAttendance(params = {}) {
    try {
      const { courseId, studentId, month, year, date } = params;
      
      let q = collection(db, 'attendance');
      const conditions = [];
      
      if (courseId) {
        conditions.push(where('courseId', '==', courseId));
      }
      if (studentId) {
        conditions.push(where('studentId', '==', studentId));
      }
      if (date) {
        conditions.push(where('dateString', '==', date));
      }
      
      if (conditions.length > 0) {
        q = query(q, ...conditions);
      }
      
      // Add ordering
      q = query(q, orderBy('date', 'desc'));
      
      const snapshot = await getDocs(q);
      let records = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        records.push(convertTimestamps(data));
      });
      
      // Filter by month/year if provided (client-side filtering)
      if (month && year) {
        records = records.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate.getMonth() + 1 === month && 
                 recordDate.getFullYear() === year;
        });
      }
      
      return {
        data: {
          records,
          total: records.length
        }
      };
    } catch (error) {
      console.error('❌ Error fetching attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance statistics for a student
   */
  async getAttendanceStats(params = {}) {
    try {
      const { courseId, studentId } = params;
      
      let q = collection(db, 'attendance');
      const conditions = [];
      
      if (courseId) {
        conditions.push(where('courseId', '==', courseId));
      }
      if (studentId) {
        conditions.push(where('studentId', '==', studentId));
      }
      
      if (conditions.length > 0) {
        q = query(q, ...conditions);
      }
      
      const snapshot = await getDocs(q);
      const records = [];
      
      snapshot.forEach(doc => {
        records.push(doc.data());
      });
      
      // Calculate statistics
      const total = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const excused = records.filter(r => r.status === 'excused').length;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
      
      // Calculate by month
      const monthlyStats = {};
      records.forEach(record => {
        const month = new Date(record.date).getMonth() + 1;
        const year = new Date(record.date).getFullYear();
        const key = `${year}-${month}`;
        
        if (!monthlyStats[key]) {
          monthlyStats[key] = { total: 0, present: 0, absent: 0, late: 0 };
        }
        monthlyStats[key].total++;
        monthlyStats[key][record.status]++;
      });
      
      return {
        data: {
          stats: {
            total,
            present,
            absent,
            late,
            excused,
            percentage,
            monthlyStats,
            records: records.slice(0, 10) // Return last 10 records
          }
        }
      };
    } catch (error) {
      console.error('❌ Error fetching attendance stats:', error);
      throw error;
    }
  }

  /**
   * Update an existing attendance record
   */
  async updateAttendance(recordId, updateData) {
    try {
      const docRef = doc(db, 'attendance', recordId);
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      
      const updated = await getDoc(docRef);
      
      return {
        data: {
          record: { id: recordId, ...updated.data() }
        }
      };
    } catch (error) {
      console.error('❌ Error updating attendance:', error);
      throw error;
    }
  }

  /**
   * Check if attendance record exists
   */
  async checkAttendanceExists(recordId) {
    try {
      const docRef = doc(db, 'attendance', recordId);
      const snapshot = await getDoc(docRef);
      return snapshot.exists();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get today's attendance status for a student in a course
   */
  async getTodayAttendance(courseId, studentId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const recordId = `${courseId}_${studentId}_${today}`;
      
      const docRef = doc(db, 'attendance', recordId);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        return {
          data: {
            record: { id: recordId, ...snapshot.data() }
          }
        };
      }
      
      return { data: { record: null } };
    } catch (error) {
      console.error('❌ Error checking today attendance:', error);
      throw error;
    }
  }

  // Helper methods
  getCurrentSemester() {
    const month = new Date().getMonth() + 1;
    return month <= 6 ? 2 : 1; // 1 = First semester, 2 = Second semester
  }

  getAcademicYear() {
    return new Date().getFullYear();
  }

  // Auth methods
  async login(credentials) {
    return credentials;
  }

  async register(userData) {
    return userData;
  }

  // ✅ API endpoint router
  async get(endpoint, options = {}) {
    const { params = {} } = options;
    
    if (endpoint === '/attendance') {
      return await this.getAttendance(params);
    }
    if (endpoint === '/attendance/stats') {
      return await this.getAttendanceStats(params);
    }
    if (endpoint === '/attendance/today') {
      return await this.getTodayAttendance(params.courseId, params.studentId);
    }
    
    // Handle collection endpoints
    const match = endpoint.match(/^\/(\w+)$/);
    if (match) {
      return await this.getCollection(match[1], params);
    }
    
    throw new Error(`Unknown GET endpoint: ${endpoint}`);
  }

  async post(endpoint, data) {
    if (endpoint === '/attendance/mark') {
      return await this.markAttendance(data);
    }
    if (endpoint === '/attendance/bulk') {
      return await this.markBulkAttendance(data);
    }
    
    // Handle collection endpoints
    const match = endpoint.match(/^\/(\w+)$/);
    if (match) {
      return await this.postDocument(match[1], data);
    }
    
    throw new Error(`Unknown POST endpoint: ${endpoint}`);
  }

  async put(endpoint, data) {
    if (endpoint.startsWith('/attendance/')) {
      const recordId = endpoint.split('/')[2];
      return await this.updateAttendance(recordId, data);
    }
    
    // Handle collection endpoints
    const match = endpoint.match(/^\/(\w+)\/(\w+)$/);
    if (match) {
      return await this.updateDocument(match[1], match[2], data);
    }
    
    throw new Error(`Unknown PUT endpoint: ${endpoint}`);
  }

  async delete(endpoint) {
    const match = endpoint.match(/^\/(\w+)\/(\w+)$/);
    if (match) {
      return await this.deleteDocument(match[1], match[2]);
    }
    
    throw new Error(`Unknown DELETE endpoint: ${endpoint}`);
  }
}

export default new FirebaseApi();