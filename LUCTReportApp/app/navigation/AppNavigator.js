// app/navigation/AppNavigator.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../config/theme';
import { checkSessionTimeout, loadStoredUser } from '../../src/store/authSlice';

// Import screens
import LoginScreen from '../auth/LoginScreen';
import RegisterScreen from '../auth/RegisterScreen';
import ForgotPassword from '../auth/ForgotPassword';

// Student screens
import StudentDashboard from '../student/StudentDashboard';
import StudentAttendance from '../student/StudentAttendance';
import StudentCourses from '../student/StudentCourses';
import StudentRatings from '../student/StudentRatings';
import StudentProfile from '../student/StudentProfile';

// Lecturer screens
import LecturerDashboard from '../lecturer/LecturerDashboard';
import LecturerClasses from '../lecturer/LecturerClasses';
import LecturerAttendance from '../lecturer/LecturerAttendance';
import LecturerReports from '../lecturer/LecturerReports';
import LecturerRatings from '../lecturer/LecturerRatings';
import LecturerProfile from '../lecturer/LecturerProfile';
import LecturerMonitoring from '../lecturer/LecturerMonitoring';
import LecturerReportingForm from '../lecturer/LecturerReportingForm'; // ← ADD THIS IMPORT

// PRL screens
import PRLDashboard from '../prl/prlDashboard';
import PRLCourses from '../prl/prlCourses';
import PRLReports from '../prl/prlReports';
import PRLMonitoring from '../prl/prlMonitoring';
import PRLRatings from '../prl/prlRatings';
import PRLProfile from '../prl/prlProfile';

// PL screens (Program Leader)
import PLDashboard from '../pl/plDashboard';
import PLCourses from '../pl/plCourses';
import PLModules from '../pl/plModules';
import PLLecturers from '../pl/plLecturers';
import PLReports from '../pl/plReports';
import PLMonitoring from '../pl/plMonitoring';
import PLRatings from '../pl/plRatings';
import PLProfile from '../pl/plProfile';
import AdminScreen from '../pl/AdminScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- Tab Navigators ---

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Attendance') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Courses') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Ratings') iconName = focused ? 'star' : 'star-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarStyle: { backgroundColor: COLORS.tabBarBackground, borderTopColor: COLORS.border },
        headerStyle: { backgroundColor: COLORS.headerBackground },
        headerTitleStyle: { color: COLORS.headerText },
      })}
    >
      <Tab.Screen name="Dashboard" component={StudentDashboard} />
      <Tab.Screen name="Attendance" component={StudentAttendance} />
      <Tab.Screen name="Courses" component={StudentCourses} />
      <Tab.Screen name="Ratings" component={StudentRatings} />
      <Tab.Screen name="Profile" component={StudentProfile} />
    </Tab.Navigator>
  );
}

// Create a stack for Lecturer to include screens not in tabs
function LecturerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LecturerTabs" component={LecturerTabs} />
      <Stack.Screen 
        name="LecturerReportingForm" 
        component={LecturerReportingForm}
        options={{ 
          headerShown: true,
          title: 'Weekly Lecture Report',
          headerStyle: { backgroundColor: COLORS.headerBackground },
          headerTitleStyle: { color: COLORS.headerText },
          headerTintColor: COLORS.primary,
        }}
      />
      <Stack.Screen 
        name="LecturerMonitoring" 
        component={LecturerMonitoring}
        options={{ 
          headerShown: true,
          title: 'Class Monitoring',
          headerStyle: { backgroundColor: COLORS.headerBackground },
          headerTitleStyle: { color: COLORS.headerText },
          headerTintColor: COLORS.primary,
        }}
      />
    </Stack.Navigator>
  );
}

function LecturerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Classes') iconName = focused ? 'school' : 'school-outline';
          else if (route.name === 'Attendance') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Reports') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Ratings') iconName = focused ? 'star' : 'star-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarStyle: { backgroundColor: COLORS.tabBarBackground, borderTopColor: COLORS.border },
        headerStyle: { backgroundColor: COLORS.headerBackground },
        headerTitleStyle: { color: COLORS.headerText },
      })}
    >
      <Tab.Screen name="Dashboard" component={LecturerDashboard} />
      <Tab.Screen name="Classes" component={LecturerClasses} />
      <Tab.Screen name="Attendance" component={LecturerAttendance} />
      <Tab.Screen name="Reports" component={LecturerReports} />
      <Tab.Screen name="Ratings" component={LecturerRatings} />
      <Tab.Screen name="Profile" component={LecturerProfile} />
    </Tab.Navigator>
  );
}

function PRLTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Courses') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Reports') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Monitoring') iconName = focused ? 'analytics' : 'analytics-outline';
          else if (route.name === 'Ratings') iconName = focused ? 'star' : 'star-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarStyle: { backgroundColor: COLORS.tabBarBackground, borderTopColor: COLORS.border },
        headerStyle: { backgroundColor: COLORS.headerBackground },
        headerTitleStyle: { color: COLORS.headerText },
      })}
    >
      <Tab.Screen name="Dashboard" component={PRLDashboard} />
      <Tab.Screen name="Courses" component={PRLCourses} />
      <Tab.Screen name="Reports" component={PRLReports} />
      <Tab.Screen name="Monitoring" component={PRLMonitoring} />
      <Tab.Screen name="Ratings" component={PRLRatings} />
      <Tab.Screen name="Profile" component={PRLProfile} />
    </Tab.Navigator>
  );
}

function PLTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Courses') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Modules') iconName = focused ? 'layers' : 'layers-outline';
          else if (route.name === 'Lecturers') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Reports') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Monitoring') iconName = focused ? 'analytics' : 'analytics-outline';
          else if (route.name === 'Ratings') iconName = focused ? 'star' : 'star-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarStyle: { backgroundColor: COLORS.tabBarBackground, borderTopColor: COLORS.border },
        headerStyle: { backgroundColor: COLORS.headerBackground },
        headerTitleStyle: { color: COLORS.headerText },
      })}
    >
      <Tab.Screen name="Dashboard" component={PLDashboard} />
      <Tab.Screen name="Courses" component={PLCourses} />
      <Tab.Screen name="Modules" component={PLModules} />
      <Tab.Screen name="Lecturers" component={PLLecturers} />
      <Tab.Screen name="Reports" component={PLReports} />
      <Tab.Screen name="Monitoring" component={PLMonitoring} />
      <Tab.Screen name="Ratings" component={PLRatings} />
      <Tab.Screen name="Profile" component={PLProfile} />
    </Tab.Navigator>
  );
}

// --- Main App Navigator ---

export default function AppNavigator() {
  const dispatch = useDispatch();
  
  // Accessing the auth state
  const auth = useSelector((state) => state.auth);
  const { isAuthenticated, user, isInitialized } = auth;

  // Load stored user on app start
  useEffect(() => {
    console.log('🔄 [AppNavigator] Loading stored user data');
    dispatch(loadStoredUser());
  }, [dispatch]);

  // Check session periodically
  useEffect(() => {
    if (!isAuthenticated) return;
    
    console.log('⏰ [AppNavigator] Starting session timeout checker');
    const sessionCheckInterval = setInterval(async () => {
      const expired = await dispatch(checkSessionTimeout()).unwrap();
      if (expired) {
        console.log('⏰ [AppNavigator] Session expired, user will be logged out');
      }
    }, 60000);
    
    return () => {
      console.log('🛑 [AppNavigator] Stopping session timeout checker');
      clearInterval(sessionCheckInterval);
    };
  }, [dispatch, isAuthenticated]);

  // Show nothing while initializing
  if (!isInitialized) {
    console.log('⏳ [AppNavigator] Auth not initialized yet, showing splash');
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </>
        ) : (
          // Authenticated flow - Switch based on role
          <>
            {user?.role === 'student' && (
              <Stack.Screen name="StudentDashboard" component={StudentTabs} />
            )}
            {user?.role === 'lecturer' && (
              <Stack.Screen name="LecturerDashboard" component={LecturerStack} />  
            )}
            {user?.role === 'prl' && (
              <Stack.Screen name="PRLDashboard" component={PRLTabs} />
            )}
            {user?.role === 'pl' && (
              <Stack.Screen name="PLDashboard" component={PLTabs} />
            )}
            
            {/* Fallback */}
            {!user?.role && (
               <Stack.Screen name="Login" component={LoginScreen} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}