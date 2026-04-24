//principal lecturer profile
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Input, Button, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { logoutUser, updateUserProfile } from '../../src/store/authSlice';

export default function PRLProfile({ navigation }) {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Get position from user data ; check multiple possible fields
  const userPosition = user?.position || user?.role || 'Principal Lecturer';
  const userStream = user?.stream || 'Not assigned';
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    employeeId: user?.employeeId || '',
    department: user?.department || user?.faculty || '',
    stream: userStream,
    position: userPosition,
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        employeeId: user.employeeId || '',
        department: user.department || user.faculty || '',
        stream: user.stream || userStream,
        position: user.position || user.role || 'Principal Lecturer',
      });
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await dispatch(logoutUser()).unwrap();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          }
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'P'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'Principal Lecturer'}</Text>
          <Text style={styles.userRole}>{userPosition}</Text>
          <Text style={styles.userId}>ID: {user?.employeeId || 'N/A'}</Text>
          {userStream !== 'Not assigned' && (
            <View style={styles.streamBadge}>
              <Ionicons name="school-outline" size={14} color={COLORS.primary} />
              <Text style={styles.streamText}>{userStream}</Text>
            </View>
          )}
        </View>

        {/* Profile Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          
          <Input
            label="Email"
            value={formData.email}
            keyboardType="email-address"
          />
          
          <Input
            label="Employee ID"
            value={formData.employeeId}
          />
          
          <Input
            label="Department"
            value={formData.department}
            onChangeText={(text) => setFormData({ ...formData, department: text })}
          />
          
          <Input
            label="Position"
            value={formData.position}
          />
        </Card>

        {/* Logout Button */}
        <Button
          title={isLoggingOut ? "Logging out..." : "Logout"}
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutButton}
          loading={isLoggingOut}
          disabled={isLoggingOut}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.buttonPrimaryText,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
    padding: spacing.xs,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userName: {
    ...typography.h2,
    color: COLORS.text,
  },
  userRole: {
    ...typography.body,
    color: COLORS.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  userId: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  streamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  streamText: {
    ...typography.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
  actionsCard: {
    marginBottom: spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    ...typography.body,
    color: COLORS.text,
    marginLeft: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
});