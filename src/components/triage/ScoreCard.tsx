'use client';

import { ReactNode } from 'react';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  icon: ReactNode;
  description: string;
  colorClass: string;
}

export function ScoreCard({
  title,
  score,
  maxScore,
  icon,
  description,
  colorClass,
}: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${colorClass}`}>{icon}</div>
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <span className="text-2xl font-bold text-gray-900">
          {score}
          <span className="text-sm font-normal text-gray-500">/{maxScore}</span>
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            percentage > 70
              ? 'bg-red-500'
              : percentage > 40
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
