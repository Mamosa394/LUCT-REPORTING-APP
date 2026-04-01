// src/components/Reports.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';
import { spacing, typography, shadows } from '../config/theme';
import { StatusBadge } from './UI';

// Report Card Component
export function ReportCard({ report, onPress, onStatusUpdate }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'monthly': return 'calendar-outline';
      case 'weekly': return 'today-outline';
      case 'incident': return 'warning-outline';
      default: return 'document-text-outline';
    }
  };

  return (
    <TouchableOpacity style={styles.reportCard} onPress={() => onPress?.(report)} activeOpacity={0.8}>
      <View style={styles.reportHeader}>
        <View style={styles.reportType}>
          <Ionicons name={getTypeIcon(report.type)} size={20} color={COLORS.primary} />
          <Text style={styles.reportTypeText}>{report.type?.toUpperCase() || 'REPORT'}</Text>
        </View>
        <StatusBadge status={report.status} />
      </View>
      
      <Text style={styles.reportTitle}>{report.title}</Text>
      
      {report.description && (
        <Text style={styles.reportDescription} numberOfLines={2}>
          {report.description}
        </Text>
      )}
      
      <View style={styles.reportMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{report.submittedBy?.name || 'Unknown'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>
            {new Date(report.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      {report.course && (
        <View style={styles.courseInfo}>
          <Ionicons name="book-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.courseText}>{report.course.name} ({report.course.code})</Text>
        </View>
      )}
      
      {report.feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackLabel}>Feedback:</Text>
          <Text style={styles.feedbackText}>{report.feedback}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Report List Component
export function ReportList({ reports, onReportPress, onStatusUpdate }) {
  if (!reports || reports.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={48} color={COLORS.textDisabled} />
        <Text style={styles.emptyText}>No reports available</Text>
      </View>
    );
  }

  return (
    <View style={styles.reportList}>
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onPress={onReportPress}
          onStatusUpdate={onStatusUpdate}
        />
      ))}
    </View>
  );
}

// Report Filter Component
export function ReportFilter({ filters, onFilterChange, onClose }) {
  const statusOptions = ['all', 'pending', 'reviewed', 'approved', 'rejected'];
  const typeOptions = ['all', 'monthly', 'weekly', 'incident', 'assessment'];

  return (
    <View style={styles.filterContainer}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Filter Reports</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.filterLabel}>Status</Text>
      <View style={styles.filterOptions}>
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              filters.status === status && styles.filterChipActive
            ]}
            onPress={() => onFilterChange('status', status)}
          >
            <Text style={[
              styles.filterChipText,
              filters.status === status && styles.filterChipTextActive
            ]}>
              {status.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.filterLabel}>Type</Text>
      <View style={styles.filterOptions}>
        {typeOptions.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterChip,
              filters.type === type && styles.filterChipActive
            ]}
            onPress={() => onFilterChange('type', type)}
          >
            <Text style={[
              styles.filterChipText,
              filters.type === type && styles.filterChipTextActive
            ]}>
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Report Stats Component
export function ReportStats({ stats }) {
  const { total = 0, pending = 0, approved = 0, rejected = 0 } = stats;
  
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>{total}</Text>
        <Text style={styles.statLabel}>Total Reports</Text>
      </View>
      <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: COLORS.border }]}>
        <Text style={[styles.statNumber, { color: COLORS.warning }]}>{pending}</Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
      <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: COLORS.border }]}>
        <Text style={[styles.statNumber, { color: COLORS.success }]}>{approved}</Text>
        <Text style={styles.statLabel}>Approved</Text>
      </View>
      <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: COLORS.border }]}>
        <Text style={[styles.statNumber, { color: COLORS.error }]}>{rejected}</Text>
        <Text style={styles.statLabel}>Rejected</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reportCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reportType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportTypeText: {
    ...typography.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  reportTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  reportDescription: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  reportMeta: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metaText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginLeft: spacing.xs,
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  courseText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginLeft: spacing.xs,
  },
  feedbackContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
  },
  feedbackLabel: {
    ...typography.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  feedbackText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  reportList: {
    padding: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.md,
  },
  filterContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.medium,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  filterTitle: {
    ...typography.h4,
    color: COLORS.text,
  },
  filterLabel: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.buttonPrimaryText,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    margin: spacing.md,
    ...shadows.small,
    overflow: 'hidden',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statNumber: {
    ...typography.h3,
    color: COLORS.text,
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
});