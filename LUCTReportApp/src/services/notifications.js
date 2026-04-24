import { Platform, Alert, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { api } from './api';

// Configure notification handler behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification categories/types
export const NOTIFICATION_TYPES = {
  ATTENDANCE: 'attendance',
  REPORT: 'report',
  RATING: 'rating',
  COURSE: 'course',
  ALERT: 'alert',
  REMINDER: 'reminder',
  SYSTEM: 'system',
};

// Notification priorities
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
    this.appStateListener = null;
    this.isAppInForeground = true;
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    try {
      await this.registerForPushNotifications();
      this.setupListeners();
      this.setupAppStateListener();
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  /**
   * Register for push notifications and get push token
   */
  async registerForPushNotifications() {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return null;
    }

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                        Constants.manifest?.extra?.eas?.projectId;
      
      if (!projectId) {
        console.log('Project ID not found');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })).data;

      console.log('Push token:', token);

      // Save token to backend
      if (token) {
        await this.savePushToken(token);
      }

      // Configure Android channels
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#C0C0C0',
          sound: 'default',
          enableVibrate: true,
          enableLights: true,
        });

        await Notifications.setNotificationChannelAsync('urgent', {
          name: 'Urgent',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250, 250, 500],
          lightColor: '#FF0000',
          sound: 'default',
          enableVibrate: true,
          enableLights: true,
        });

        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#C0C0C0',
          sound: 'default',
          enableVibrate: true,
          enableLights: true,
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Save push token to backend
   */
  async savePushToken(token) {
    try {
      await api.post('/notifications/register-token', { token });
      console.log('Push token saved successfully');
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  /**
   * Remove push token from backend
   */
  async removePushToken(token) {
    try {
      await api.post('/notifications/remove-token', { token });
      console.log('Push token removed successfully');
    } catch (error) {
      console.error('Error removing push token:', error);
    }
  }

  /**
   * Setup notification listeners
   */
  setupListeners() {
    // Listener for notifications received while app is foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived.bind(this)
    );

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse.bind(this)
    );
  }

  /**
   * Setup app state listener to handle foreground/background states
   */
  setupAppStateListener() {
    this.appStateListener = AppState.addEventListener('change', (nextAppState) => {
      this.isAppInForeground = nextAppState === 'active';
    });
  }

  /**
   * Handle notification received
   */
  handleNotificationReceived(notification) {
    console.log('Notification received:', notification);
    
    const { data } = notification.request.content;
    
    // Store notification in local storage or state management
    this.storeNotification({
      id: notification.request.identifier,
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: data,
      timestamp: new Date().toISOString(),
      read: false,
    });

    // Emit event for real-time updates
    this.emitNotificationReceived(notification);
  }

  /**
   * Handle user tapping on notification
   */
  handleNotificationResponse(response) {
    console.log('Notification response:', response);
    
    const { data } = response.notification.request.content;
    
    // Mark notification as read
    this.markNotificationAsRead(response.notification.request.identifier);
    
    // Navigate based on notification type
    this.handleNotificationNavigation(data);
    
    // Emit event for response
    this.emitNotificationResponse(response);
  }

  /**
   * Handle navigation based on notification data
   */
  handleNotificationNavigation(data) {
    const { type, screen, params } = data;
    
    // You'll need to implement navigation logic based on your navigation structure
    // This is a placeholder - you'll need to integrate with your navigation ref
    if (global.navigationRef) {
      switch (type) {
        case NOTIFICATION_TYPES.ATTENDANCE:
          global.navigationRef.navigate('Attendance', params);
          break;
        case NOTIFICATION_TYPES.REPORT:
          global.navigationRef.navigate('Reports', params);
          break;
        case NOTIFICATION_TYPES.RATING:
          global.navigationRef.navigate('Ratings', params);
          break;
        case NOTIFICATION_TYPES.COURSE:
          global.navigationRef.navigate('Courses', params);
          break;
        case NOTIFICATION_TYPES.ALERT:
          global.navigationRef.navigate('Alerts', params);
          break;
        default:
          global.navigationRef.navigate(screen || 'Home', params);
      }
    }
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(title, body, data = {}, options = {}) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: options.sound !== false,
          badge: options.badge,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          channelId: options.channelId || 'default',
          color: '#C0C0C0',
        },
        trigger: options.trigger || null, // null = immediate
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return null;
    }
  }

  /**
   * Schedule a notification
   */
  async scheduleNotification(title, body, trigger, data = {}, options = {}) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: options.sound !== false,
          badge: options.badge,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          channelId: options.channelId || 'default',
          color: '#C0C0C0',
        },
        trigger: trigger,
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      return false;
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Store notification in local storage
   */
  storeNotification(notification) {
    // This is a placeholder - implement with your storage solution (AsyncStorage, Redux, etc.)
    // Example using AsyncStorage:
    // const stored = await AsyncStorage.getItem('notifications');
    // const notifications = stored ? JSON.parse(stored) : [];
    // notifications.unshift(notification);
    // await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Or dispatch to Redux store:
    // store.dispatch(addNotification(notification));
    
    console.log('Storing notification:', notification);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    // Implement marking notification as read in your storage solution
    console.log('Marking notification as read:', notificationId);
  }

  /**
   * Get all notifications
   */
  async getNotifications() {
    // Implement getting notifications from your storage solution
    // Example return format:
    return [];
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      // Clear local storage as well
      console.log('All notifications cleared');
      return true;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return false;
    }
  }

  /**
   * Event emitters (implement with your preferred event system)
   */
  emitNotificationReceived(notification) {
    // Implement event emission for real-time updates
    // Example with EventEmitter:
    // EventEmitter.emit('notificationReceived', notification);
  }

  emitNotificationResponse(response) {
    // Implement event emission for response
    // EventEmitter.emit('notificationResponse', response);
  }

  /**
   * Clean up listeners
   */
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
  }

  //App-Specific Notification Methods

  /**
   * Send attendance reminder notification
   */
  async sendAttendanceReminder(courseName, timeLeft) {
    return await this.sendLocalNotification(
      'Attendance Reminder',
      `Don't forget to mark attendance for ${courseName}. ${timeLeft} minutes remaining!`,
      {
        type: NOTIFICATION_TYPES.ATTENDANCE,
        screen: 'Attendance',
        courseName,
      },
      {
        channelId: 'reminders',
        badge: 1,
      }
    );
  }

  /**
   * Send report submitted notification
   */
  async sendReportSubmittedNotification(reportTitle, submittedBy) {
    return await this.sendLocalNotification(
      'Report Submitted',
      `${submittedBy} has submitted a new report: ${reportTitle}`,
      {
        type: NOTIFICATION_TYPES.REPORT,
        screen: 'Reports',
        reportTitle,
        submittedBy,
      },
      {
        channelId: 'default',
        badge: 1,
      }
    );
  }

  /**
   * Send rating received notification
   */
  async sendRatingReceivedNotification(courseName, rating) {
    return await this.sendLocalNotification(
      'New Rating Received',
      `You received a ${rating}-star rating for ${courseName}`,
      {
        type: NOTIFICATION_TYPES.RATING,
        screen: 'Ratings',
        courseName,
        rating,
      },
      {
        channelId: 'default',
        badge: 1,
      }
    );
  }

  /**
   * Send course update notification
   */
  async sendCourseUpdateNotification(courseName, updateType) {
    return await this.sendLocalNotification(
      'Course Update',
      `${courseName} has been ${updateType}`,
      {
        type: NOTIFICATION_TYPES.COURSE,
        screen: 'Courses',
        courseName,
        updateType,
      },
      {
        channelId: 'default',
        badge: 1,
      }
    );
  }

  /**
   * Send urgent alert notification
   */
  async sendUrgentAlertNotification(title, message, data = {}) {
    return await this.sendLocalNotification(
      title,
      message,
      {
        type: NOTIFICATION_TYPES.ALERT,
        priority: NOTIFICATION_PRIORITY.URGENT,
        ...data,
      },
      {
        channelId: 'urgent',
        badge: 1,
        sound: true,
      }
    );
  }

  /**
   * Send report deadline reminder
   */
  async sendReportDeadlineReminder(reportTitle, daysLeft) {
    return await this.sendLocalNotification(
      'Report Deadline Approaching',
      `Your report "${reportTitle}" is due in ${daysLeft} days`,
      {
        type: NOTIFICATION_TYPES.REMINDER,
        screen: 'Reports',
        reportTitle,
        daysLeft,
      },
      {
        channelId: 'reminders',
        badge: 1,
      }
    );
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;

// Export individual methods for easier imports
export const initializeNotifications = () => notificationService.initialize();
export const sendLocalNotification = (...args) => notificationService.sendLocalNotification(...args);
export const scheduleNotification = (...args) => notificationService.scheduleNotification(...args);
export const cancelNotification = (id) => notificationService.cancelNotification(id);
export const cancelAllNotifications = () => notificationService.cancelAllNotifications();
export const clearAllNotifications = () => notificationService.clearAllNotifications();
export const getNotifications = () => notificationService.getNotifications();