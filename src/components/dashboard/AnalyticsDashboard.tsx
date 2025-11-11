'use client';

import React, { useEffect, useState } from 'react';
import { AnalyticsSummary, ConversationMetrics } from '@/lib/analytics/types';
import { logger } from '@/lib/logger';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/summary');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      logger.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`${className} text-center py-8`}>
        <div className="text-red-600 mb-4">
          {error || 'Analytics unavailable'}
        </div>
        <button 
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Time Period Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Today" metrics={analytics.today} />
        <MetricCard title="This Week" metrics={analytics.week} />
        <MetricCard title="This Month" metrics={analytics.month} />
      </div>

      {/* Top Intents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top User Intents</h3>
          {analytics.top_intents.length > 0 ? (
            <div className="space-y-3">
              {analytics.top_intents.slice(0, 5).map((intent, index) => (
                <div key={intent.intent} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium">{intent.intent}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{intent.count} times</div>
                    <div className="text-xs text-gray-500">
                      {(intent.conversion_rate * 100).toFixed(1)}% conversion
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No intent data available yet</p>
          )}
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Activity by Hour</h3>
          <div className="space-y-2">
            {analytics.hourly_distribution.map(({ hour, conversations }) => (
              <div key={hour} className="flex items-center">
                <span className="w-8 text-sm text-gray-600">{hour}:00</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${Math.max(5, (conversations / Math.max(...analytics.hourly_distribution.map(h => h.conversations))) * 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{conversations}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button 
          onClick={fetchAnalytics}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  metrics: ConversationMetrics;
}

function MetricCard({ title, metrics }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Replies</span>
          <span className="font-medium">{metrics.total_conversations}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Avg Response Time</span>
          <span className="font-medium">{metrics.avg_response_time}ms</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Confidence Score</span>
          <span className="font-medium">{(metrics.avg_confidence_score * 100).toFixed(1)}%</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Lead Conversion</span>
          <span className="font-medium text-green-600">{(metrics.lead_conversion_rate * 100).toFixed(1)}%</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Satisfaction</span>
          <span className="font-medium">{metrics.satisfaction_avg.toFixed(1)}/5</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Fallback Rate</span>
          <span className={`font-medium ${metrics.fallback_rate > 0.2 ? 'text-red-600' : 'text-green-600'}`}>
            {(metrics.fallback_rate * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}