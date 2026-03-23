'use client';

import { useState } from 'react';

export function BarChart({
  data,
  title,
  subtitle,
}: {
  data: Array<{ label: string; value: number }>;
  title: string;
  subtitle: string;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  const maxValue = Math.max(...data.map((d) => d.value));
  const periods = ['7d', '30d', '90d', '12m'];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="chart-periods">
          {periods.map((period) => (
            <button
              key={period}
              className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bar-chart">
        {data.map((item, idx) => (
          <div key={idx} className="bar-group">
            <div className="bars">
              <div
                className="bar primary"
                style={{ height: `${(item.value / maxValue) * 150}px` }}
                title={`${item.label}: ${item.value}`}
              ></div>
              <div
                className="bar secondary"
                style={{ height: `${(item.value * 0.8) / maxValue * 150}px` }}
              ></div>
            </div>
            <div className="bar-label">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#38BDF8' }}></span>
          <span>This Period</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#D1D5DB' }}></span>
          <span>Previous Period</span>
        </div>
      </div>
    </div>
  );
}
