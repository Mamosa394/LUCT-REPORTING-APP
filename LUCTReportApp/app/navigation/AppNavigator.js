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
import StudentDashboard from '../student/Dashboard';
import StudentAttendance from '../student/Attendance';
import StudentCourses from '../student/Courses';
import StudentRatings from '../student/Ratings';
import StudentProfile from '../student/Profile';

// Lecturer screens
import LecturerDashboard from '../lecturer/Dashboard';
import LecturerClasses from '../lecturer/Classes';
import LecturerAttendance from '../lecturer/Attendance';
import LecturerReports from '../lecturer/Reports';
import LecturerRatings from '../lecturer/Ratings';
import LecturerProfile from '../lecturer/Profile';

// PRL screens
import PRLDashboard from '../prl/Dashboard';
import PRLCourses from '../prl/Courses';
import PRLReports from '../prl/Reports';
import PRLMonitoring from '../prl/Monitoring';
import PRLRatings from '../prl/Ratings';
import PRLProfile from '../prl/Profile';

// PL screens (Program Leader - now has admin privileges)
import PLDashboard from '../pl/Dashboard';
import PLCourses from '../pl/Courses';
import PLModules from '../pl/Modules';
import PLLecturers from '../pl/Lecturers';
import PLReports from '../pl/Reports';
import PLMonitoring from '../pl/Monitoring';
import PLRatings from '../pl/Ratings';
import PLProfile from '../pl/Profile';
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
        component={PLAdminPanel} 
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

// Main Navigator
export default function AppNavigator() {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // Determine which tab navigator to use based on user role
  const getNavigator = () => {
    if (!isAuthenticated || !user) {
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </Stack.Navigator>
      );
    }
    
    // Role-based navigation - Admin role removed, PL now has admin privileges
    switch (user.role) {
      case 'student':
        return <StudentTabs />;
      case 'lecturer':
        return <LecturerTabs />;
      case 'prl':
        return <PRLTabs />;
      case 'pl':
        return <PLTabs />; // Program Leader now has full admin access
      default:
        // Fallback to student if role is invalid
        console.warn(`Unknown role: ${user.role}, defaulting to StudentTabs`);
        return <StudentTabs />;
    }
  };

  return (
    <NavigationContainer>
      {getNavigator()}
    </NavigationContainer>
  );
}