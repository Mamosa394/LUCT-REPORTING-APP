// src/components/Attendance.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../config/theme';
import { spacing, typography, shadows } from '../../config/theme';

// Attendance Calendar
export function AttendanceCalendar({ records, onDayPress }) {
  const markedDates = useMemo(() => {
    const marks = {};
    records.forEach((r) => {
      const dateStr = r.date?.split('T')[0];
      const colorMap = {
        present: COLORS.success,
        absent: COLORS.error,
        late: COLORS.warning,
        excused: COLORS.info,
      };
      marks[dateStr] = {
        selected: true,
        selectedColor: colorMap[r.status] || COLORS.primary,
        dotColor: colorMap[r.status] || COLORS.primary,
        marked: true,
      };
    });
    return marks;
  }, [records]);

  return (
    <Calendar
      markedDates={markedDates}
      onDayPress={onDayPress}
      theme={{
        backgroundColor: COLORS.cardBackground,
        calendarBackground: COLORS.cardBackground,
        textSectionTitleColor: COLORS.textSecondary,
        selectedDayBackgroundColor: COLORS.primary,
        selectedDayTextColor: COLORS.buttonPrimaryText,
        todayTextColor: COLORS.primary,
        dayTextColor: COLORS.text,
        textDisabledColor: COLORS.textDisabled,
        dotColor: COLORS.primary,
        monthTextColor: COLORS.text,
        indicatorColor: COLORS.primary,
        arrowColor: COLORS.primary,
        textDayFontSize: 14,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 12,
      }}
      style={styles.calendar}
    />
  );
}

// Attendance Legend
export function AttendanceLegend() {
  const items = [
    { label: 'Present', color: COLORS.success },
    { label: 'Absent', color: COLORS.error },
    { label: 'Late', color: COLORS.warning },
    { label: 'Excused', color: COLORS.info },
  ];
  return (
    <View style={styles.legend}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function StatItem({ label, value, color }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Mark Attendance Row
export function MarkAttendanceRow({ student, status, onStatusChange }) {
  const statuses = ['present', 'absent', 'late', 'excused'];
  const colorMap = {
    present: COLORS.success,
    absent: COLORS.error,
    late: COLORS.warning,
    excused: COLORS.info,
  };

  return (
    <View style={styles.attendanceRow}>
      <View style={styles.studentInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.name?.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <View>
          <Text style={styles.studentName}>{student.name || student.fullName}</Text>
          <Text style={styles.studentId}>{student.studentId || student.id}</Text>
        </View>
      </View>
      <View style={styles.statusButtons}>
        {statuses.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => onStatusChange(s)}
            style={[
              styles.statusBtn,
              status === s && { backgroundColor: colorMap[s] }
            ]}
          >
            <Text style={[
              styles.statusBtnText,
              status === s && { color: COLORS.buttonPrimaryText }
            ]}>
              {s.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: { 
    borderRadius: 12, 
    ...shadows.small, 
    marginBottom: spacing.md,
    backgroundColor: COLORS.cardBackground,
  },
  legend: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingVertical: spacing.sm,
    backgroundColor: COLORS.background,
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  legendDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    marginRight: spacing.xs 
  },
  legendLabel: { 
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.medium,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  percentageCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  percentageText: { 
    fontSize: 20, 
    fontWeight: '800' 
  },
  percentageLabel: { 
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  statsGrid: { 
    flex: 1, 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  statItem: { 
    width: '50%', 
    alignItems: 'center', 
    marginBottom: spacing.sm 
  },
  statValue: { 
    fontSize: 22, 
    fontWeight: '700' 
  },
  statLabel: { 
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  studentInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: { 
    color: COLORS.primary, 
    fontWeight: '700', 
    fontSize: 16 
  },
  studentName: { 
    ...typography.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  studentId: { 
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  statusButtons: { 
    flexDirection: 'row' 
  },
  statusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusBtnText: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: COLORS.textSecondary 
  },
});