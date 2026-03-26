import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter, useSegments } from 'expo-router';
import { subscribeToAuthChanges, getUserProfile } from '../../services/firebase/auth';
import { setUser, setInitialized } from '../../store/slices/authSlice';
import { LoadingSpinner } from '../common/UIComponents';
import { useAuth } from '../../utils/hooks/useAuth';

export default function AuthGuard({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();
  const { user, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          dispatch(setUser(profile));
        } catch {
          dispatch(setUser(null));
        }
      } else {
        dispatch(setUser(null));
        dispatch(setInitialized());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Route to role-based dashboard
      const role = user?.role;
      const routes = {
        student: '/(student)/dashboard',
        lecturer: '/(lecturer)/dashboard',
        prl: '/(prl)/dashboard',
        pl: '/(pl)/dashboard',
      };
      router.replace(routes[role] || '/(auth)/login');
    }
  }, [isAuthenticated, isInitialized, segments, user]);

  if (!isInitialized) {
    return <LoadingSpinner fullScreen message="Starting EduTrack..." />;
  }

  return children;
}