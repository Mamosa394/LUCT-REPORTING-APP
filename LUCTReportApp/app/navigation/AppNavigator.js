// app/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS } from '../../config/theme';

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

// PRL screens
import PRLDashboard from '../prl/prlDashboard';
import PRLCourses from '../prl/prlCourses';
import PRLReports from '../prl/prlReports';
import PRLMonitoring from '../prl/prlMonitoring';
import PRLRatings from '../prl/prlRatings';
import PRLProfile from '../prl/prlProfile';

// PL screens (Program Leader - now has admin privileges)
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

// Tab Navigator for Student
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
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBackground,
          borderTopColor: COLORS.border,
        },
        headerStyle: {
          backgroundColor: COLORS.headerBackground,
        },
        headerTitleStyle: {
          color: COLORS.headerText,
        },
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

// Tab Navigator for Lecturer
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
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBackground,
          borderTopColor: COLORS.border,
        },
        headerStyle: {
          backgroundColor: COLORS.headerBackground,
        },
        headerTitleStyle: {
          color: COLORS.headerText,
        },
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

// Tab Navigator for PRL
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
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBackground,
          borderTopColor: COLORS.border,
        },
        headerStyle: {
          backgroundColor: COLORS.headerBackground,
        },
        headerTitleStyle: {
          color: COLORS.headerText,
        },
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

// Tab Navigator for PL (Program Leader with Admin Privileges)
function PLTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Admin Panel') iconName = focused ? 'shield' : 'shield-outline';
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
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBackground,
          borderTopColor: COLORS.border,
        },
        headerStyle: {
          backgroundColor: COLORS.headerBackground,
        },
        headerTitleStyle: {
          color: COLORS.headerText,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={PLDashboard} 
        options={{ title: 'PL Dashboard' }}
      />
      <Tab.Screen 
        name="Admin Panel" 
        component={AdminScreen} 
        options={{ 
          title: 'Admin Panel',
          tabBarLabel: 'Admin',
        }}
      />
      <Tab.Screen 
        name="Courses" 
        component={PLCourses} 
      />
      <Tab.Screen 
        name="Modules" 
        component={PLModules} 
      />
      <Tab.Screen 
        name="Lecturers" 
        component={PLLecturers} 
      />
      <Tab.Screen 
        name="Reports" 
        component={PLReports} 
      />
      <Tab.Screen 
        name="Monitoring" 
        component={PLMonitoring} 
      />
      <Tab.Screen 
        name="Ratings" 
        component={PLRatings} 
      />
      <Tab.Screen 
        name="Profile" 
        component={PLProfile} 
      />
    </Tab.Navigator>
  );
}

// Main Navigator - FIXED: Now properly registers all screens in Stack Navigator
export default function AppNavigator() {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </>
        ) : (
          // Dashboard screens based on role
          <>
            {user?.role === 'student' && (
              <Stack.Screen name="StudentDashboard" component={StudentTabs} />
            )}
            {user?.role === 'lecturer' && (
              <Stack.Screen name="LecturerDashboard" component={LecturerTabs} />
            )}
            {user?.role === 'prl' && (
              <Stack.Screen name="PRLDashboard" component={PRLTabs} />
            )}
            {user?.role === 'pl' && (
              <Stack.Screen name="PLDashboard" component={PLTabs} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}