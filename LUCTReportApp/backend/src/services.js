const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { initializeFirebaseAdmin } = require('./firebase-admin');
const config = require('./config');

// Initialize Firebase Admin
initializeFirebaseAdmin();
const db = admin.firestore();
const auth = admin.auth();

// Email service
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const transporter = nodemailer.createTransport(config.emailConfig);
    
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <p>Hello ${data.name || 'User'},</p>
    `;
    
    if (template === 'welcome') {
      html += `
        <p>Welcome to LUCT Reporting App! We're excited to have you on board.</p>
        <p>You can now access your dashboard and start using the app.</p>
      `;
    } else if (template === 'passwordReset') {
      html += `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${data.resetUrl}" style="background: #C0C0C0; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;
    }
    
    html += `
        <p>Best regards,<br/>LUCT Reporting App Team</p>
      </div>
    `;
    
    await transporter.sendMail({
      from: config.emailConfig.from,
      to,
      subject,
      html,
    });
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Push notification service
const sendPushNotification = async ({ userId, title, body, data = {} }) => {
  try {
    // Get user's push tokens from Firestore
    const tokensSnapshot = await db.collection('pushTokens')
      .where('userId', '==', userId)
      .get();
    
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    
    if (tokens.length === 0) return false;
    
    const message = {
      notification: { title, body },
      data: data,
      tokens: tokens,
    };
    
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('Push notifications sent:', response.successCount, 'successful');
    
    return response;
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
};

// Firestore Collections
const collections = {
  users: () => db.collection('users'),
  courses: () => db.collection('courses'),
  attendance: () => db.collection('attendance'),
  reports: () => db.collection('reports'),
  ratings: () => db.collection('ratings'),
  notifications: () => db.collection('notifications'),
  pushTokens: () => db.collection('pushTokens'),
};

// User Model
const User = {
  async create(userData) {
    const userRef = collections.users().doc();
    await userRef.set({
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
    });
    return { id: userRef.id, ...userData };
  },
  
  async findById(id) {
    const doc = await collections.users().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  async findByEmail(email) {
    const snapshot = await collections.users().where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },
  
  async update(id, data) {
    await collections.users().doc(id).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return this.findById(id);
  },
  
  async findAll(filters = {}) {
    let query = collections.users();
    
    if (filters.role) {
      query = query.where('role', '==', filters.role);
    }
    if (filters.isActive !== undefined) {
      query = query.where('isActive', '==', filters.isActive);
    }
    if (filters.department) {
      query = query.where('department', '==', filters.department);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async addToEnrolledCourses(userId, courseId) {
    await collections.users().doc(userId).update({
      enrolledCourses: admin.firestore.FieldValue.arrayUnion(courseId),
    });
  },
};

// Course Model
const Course = {
  async create(courseData) {
    const courseRef = collections.courses().doc();
    await courseRef.set({
      ...courseData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
    });
    return { id: courseRef.id, ...courseData };
  },
  
  async findById(id) {
    const doc = await collections.courses().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  async update(id, data) {
    await collections.courses().doc(id).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return this.findById(id);
  },
  
  async findAll(filters = {}) {
    let query = collections.courses();
    
    if (filters.department) query = query.where('department', '==', filters.department);
    if (filters.lecturerId) query = query.where('lecturerId', '==', filters.lecturerId);
    if (filters.semester) query = query.where('semester', '==', filters.semester);
    if (filters.year) query = query.where('year', '==', filters.year);
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async getWithLecturer(id) {
    const course = await this.findById(id);
    if (!course) return null;
    if (course.lecturerId) {
      const lecturer = await User.findById(course.lecturerId);
      course.lecturer = lecturer;
    }
    return course;
  },
};

// Attendance Model
const Attendance = {
  async create(attendanceData) {
    const attendanceRef = collections.attendance().doc();
    await attendanceRef.set({
      ...attendanceData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: attendanceRef.id, ...attendanceData };
  },
  
  async findByCourse(courseId, filters = {}) {
    let query = collections.attendance().where('courseId', '==', courseId);
    if (filters.startDate && filters.endDate) {
      query = query.where('date', '>=', filters.startDate)
                   .where('date', '<=', filters.endDate);
    }
    const snapshot = await query.orderBy('date', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

// Report Model
const Report = {
  async create(reportData) {
    const reportRef = collections.reports().doc();
    await reportRef.set({
      ...reportData,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: reportRef.id, ...reportData };
  },
  
  async findAll(filters = {}) {
    let query = collections.reports();
    if (filters.status) query = query.where('status', '==', filters.status);
    if (filters.submittedBy) query = query.where('submittedBy', '==', filters.submittedBy);
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async update(id, data) {
    await collections.reports().doc(id).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return this.findById(id);
  },
  
  async findById(id) {
    const doc = await collections.reports().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
};

// Rating Model
const Rating = {
  async create(ratingData) {
    const ratingRef = collections.ratings().doc();
    await ratingRef.set({
      ...ratingData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: ratingRef.id, ...ratingData };
  },
  
  async findByLecturer(lecturerId) {
    const snapshot = await collections.ratings()
      .where('lecturerId', '==', lecturerId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

// Notification Model
const Notification = {
  async create(notificationData) {
    const notificationRef = collections.notifications().doc();
    await notificationRef.set({
      ...notificationData,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: notificationRef.id, ...notificationData };
  },
  
  async findByUser(userId, limit = 50) {
    const snapshot = await collections.notifications()
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

// PushToken Model
const PushToken = {
  async saveToken(userId, token) {
    const tokenRef = collections.pushTokens().doc();
    await tokenRef.set({
      userId,
      token,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: tokenRef.id };
  },
  
  async getTokensForUser(userId) {
    const snapshot = await collections.pushTokens()
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => doc.data().token);
  },
};

module.exports = {
  db,
  auth,
  User,
  Course,
  Attendance,
  Report,
  Rating,
  Notification,
  PushToken,
  sendEmail,
  sendPushNotification,
  collections,
};