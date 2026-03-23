'use client';

import React from 'react';

export function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorMap = {
    blue: '#38BDF8',
    green: '#22C55E',
    purple: '#A855F7',
    orange: '#F59E0B',
  };

  return (
    <div className="metric-card">
      <div className="metric-header">
        <h3>{title}</h3>
        {icon && <div className="metric-icon">{icon}</div>}
      </div>
      <div className="metric-value">{value}</div>
      <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
        <span className="change-icon">{isPositive ? '↗' : '↘'}</span>
        <span>{change}</span>
      </div>
    </div>
  );
}

export function ActivityItem({
  type,
  title,
  description,
  timestamp,
  icon,
}: {
  type: 'file' | 'task' | 'comment' | 'team' | 'deployment' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  icon?: React.ReactNode;
}) {
  const iconConfig: Record<string, { bg: string; color: string; svg: React.ReactNode }> = {
    file: {
      bg: '#E0F2FE', // light blue
      color: '#38BDF8',
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
    },
    task: {
      bg: '#DCFCE7', // light green
      color: '#22C55E',
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
    },
    comment: {
      bg: '#F3E8FF', // light purple
      color: '#A855F7',
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    },
    team: {
      bg: '#F1F5F9', // light gray / blue
      color: '#64748B',
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    },
    notification: {
      bg: '#FEF3C7', // light yellow
      color: '#F59E0B',
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    },
    deployment: {
      bg: '#FEE2E2', // light red
      color: '#EF4444',
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    }
  };

  const config = iconConfig[type];

  return (
    <div className="activity-item">
      <div className="activity-icon" style={{ background: config?.bg, color: config?.color }}>
        {icon || config?.svg}
      </div>
      <div className="activity-content">
        <p className="activity-title">
          <strong>{title}</strong> {description}
        </p>
        <p className="activity-time">{timestamp}</p>
      </div>
    </div>
  );
}

export function StatCard({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count: string;
}) {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <p className="stat-subtitle">{subtitle}</p>
      <div className="stat-bar"></div>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </div>
  );
}
