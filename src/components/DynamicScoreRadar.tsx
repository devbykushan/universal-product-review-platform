'use client';

import React, { useEffect, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CategoryMetric } from '../types';

interface DynamicScoreRadarProps {
  metrics: CategoryMetric[];
  scores: Record<string, number>; // e.g. { performance: 9.8, battery: 9.1 }
  productName: string;
}

export function DynamicScoreRadar({
  metrics,
  scores,
  productName,
}: DynamicScoreRadarProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = metrics.map((metric) => ({
    metric: metric.label,
    score: scores[metric.key] ?? 5,
    fullMark: 10,
  }));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Category Evaluation Engine
          </h3>
          <p className="text-xs text-slate-500">
            Dynamically measured criteria tailored for this category
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
          Scale: 1 – 10.0
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Radar Chart */}
        <div className="md:col-span-6 h-[260px] w-full flex items-center justify-center">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 10]}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Radar
                  name={productName}
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      return (
                        <div className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
                          <p className="font-semibold">{item.payload.metric}</p>
                          <p className="text-indigo-300">
                            Score: {Number(item.value).toFixed(1)} / 10
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Loading radar chart...
            </div>
          )}
        </div>

        {/* Dynamic Metric Progress Bars */}
        <div className="md:col-span-6 space-y-4">
          {metrics.map((metric) => {
            const rawScore = scores[metric.key] ?? 5;
            const pct = Math.min(100, Math.max(0, (rawScore / 10) * 100));

            // Color gradient based on score
            const barColor =
              rawScore >= 9.0
                ? 'bg-emerald-500'
                : rawScore >= 7.5
                ? 'bg-indigo-600'
                : rawScore >= 6.0
                ? 'bg-amber-500'
                : 'bg-rose-500';

            return (
              <div key={metric.key} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">
                      {metric.label}
                    </span>
                    <span className="text-slate-400 ml-1.5 hidden sm:inline">
                      • {metric.description}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {rawScore.toFixed(1)} <span className="text-slate-400 font-normal">/ 10</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
