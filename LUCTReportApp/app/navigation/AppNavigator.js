import React from 'react';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { selectUser } from '../store/slices/authSlice';
import { ROLES } from '../config/theme';

import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import LecturerNavigator from './LecturerNavigator';
import PRLNavigator from './PRLNavigator';
import PLNavigator from './PLNavigator';

const Stack = createNativeStackNavigator();

/**
 * RootNavigator routes to the correct navigator based on auth state and role
 */
export default function AppNavigator() {
  const user = useSelector(selectUser);

  if (!user) {
    return <AuthNavigator />;
  }

  switch (user.role) {
    case ROLES.STUDENT:
      return <StudentNavigator />;
    case ROLES.LECTURER:
      return <LecturerNavigator />;
    case ROLES.PRL:
      return <PRLNavigator />;
    case ROLES.PL:
      return <PLNavigator />;
    default:
      return <AuthNavigator />;
  }
}