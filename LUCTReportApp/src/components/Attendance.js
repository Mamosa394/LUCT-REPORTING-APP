import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../styles/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../styles/typography';
import { formatCalendarDate } from '../../utils/formatters/dateFormatter';

// ─── Attendance Calendar ──────────────────────────────────────────────────────
export function AttendanceCalendar({ records, onDayPress }) {
  const markedDates = useMemo(() => {
    const marks = {};
    records.forEach((r) => {
      const dateStr = formatCalendarDate(r.date);
      const colorMap = {
        present: COLORS.present,
        absent: COLORS.absent,
        late: COLORS.late,
        excused: COLORS.excused,
      };
      marks[dateStr] = {
        selected: true,
        selectedColor: colorMap[r.status] || COLORS.gray400,
        dotColor: colorMap[r.status],
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
        backgroundColor: COLORS.white,
        calendarBackground: COLORS.white,
        textSectionTitleColor: COLORS.textSecondary,
        selectedDayBackgroundColor: COLORS.primary,
        selectedDayTextColor: COLORS.white,
        todayTextColor: COLORS.primary,
        dayTextColor: COLORS.text,
        textDisabledColor: COLORS.textLight,
        dotColor: COLORS.primary,
        monthTextColor: COLORS.text,
        indicatorColor: COLORS.primary,
        arrowColor: COLORS.primary,
      }}
      style={styles.calendar}
    />
  );
}

// ─── Attendance Legend ────────────────────────────────────────────────────────
export function AttendanceLegend() {
  const items = [
    { label: 'Present', color: COLORS.present },
    { label: 'Absent', color: COLORS.absent },
    { label: 'Late', color: COLORS.late },
    { label: 'Excused', color: COLORS.excused },
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

// ─── Attendance Summary Card ──────────────────────────────────────────────────
export function AttendanceSummaryCard({ summary }) {
  const { total, present, absent, late, excused, percentage } = summary;

  const getPercentageColor = () => {
    if (percentage >= 75) return COLORS.success;
    if (percentage >= 50) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <View style={styles.summaryCard}>
      <View style={styles.percentageCircle}>
        <Text style={[styles.percentageText, { color: getPercentageColor() }]}>{percentage}%</Text>
        <Text style={styles.percentageLabel}>Attendance</Text>
      </View>
      <View style={styles.statsGrid}>
        <StatItem label="Total" value={total} color={COLORS.primary} />
        <StatItem label="Present" value={present} color={COLORS.present} />
        <StatItem label="Absent" value={absent} color={COLORS.absent} />
        <StatItem label="Late" value={late} color={COLORS.late} />
      </View>
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

// ─── Mark Attendance Row ──────────────────────────────────────────────────────
export function MarkAttendanceRow({ student, status, onStatusChange }) {
  const statuses = ['present', 'absent', 'late', 'excused'];
  const colorMap = {
    present: COLORS.present,
    absent: COLORS.absent,
    late: COLORS.late,
    excused: COLORS.excused,
  };

  return (
    <View style={styles.attendanceRow}>
      <View style={styles.studentInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.fullName?.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.studentName}>{student.fullName}</Text>
          <Text style={styles.studentId}>{student.studentId || student.uid}</Text>
        </View>
      </View>
      <View style={styles.statusButtons}>
        {statuses.map((s) => (
          <TouchableButton
            key={s}
            label={s.charAt(0).toUpperCase()}
            isSelected={status === s}
            color={colorMap[s]}
            onPress={() => onStatusChange(s)}
          />
        ))}
      </View>
    </View>
  );
}

function TouchableButton({ label, isSelected, color, onPress }) {
  const { TouchableOpacity } = require('react-native');
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.statusBtn, isSelected && { backgroundColor: color }]}
    >
      <Text style={[styles.statusBtnText, isSelected && { color: COLORS.white }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  calendar: { borderRadius: BORDER_RADIUS.lg, ...SHADOWS.sm, marginBottom: SPACING.md },
  legend: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: SPACING.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.xs },
  legendLabel: { ...TYPOGRAPHY.caption },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  percentageCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  percentageText: { fontSize: 20, fontWeight: '800' },
  percentageLabel: { ...TYPOGRAPHY.caption },
  statsGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', alignItems: 'center', marginBottom: SPACING.sm },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { ...TYPOGRAPHY.caption },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  studentName: { ...TYPOGRAPHY.body2, fontWeight: '600' },
  studentId: { ...TYPOGRAPHY.caption },
  statusButtons: { flexDirection: 'row' },
  statusBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  statusBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.gray600 },
});