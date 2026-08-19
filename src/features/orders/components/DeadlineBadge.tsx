import React from 'react';
import { useDeadline, RiskLevel, StasisStatus } from '../hooks/useDeadline';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import TimerOutlined from '@mui/icons-material/TimerOutlined';
import AcUnitOutlined from '@mui/icons-material/AcUnitOutlined';

interface DeadlineBadgeProps {
  orderId: string;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({ orderId }) => {
  const { data: deadline, isLoading, error } = useDeadline(orderId);

  if (isLoading || !deadline) return <div className="h-6 w-20 animate-pulse bg-gray-200 rounded" />;
  if (error) return null;

  const config = {
    [RiskLevel.ON_TRACK]: {
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      icon: <ScheduleOutlined sx={{ fontSize: 14 }} />,
      label: 'On Track',
    },
    [RiskLevel.AT_RISK]: {
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      icon: <WarningAmberOutlined sx={{ fontSize: 14 }} />,
      label: 'At Risk',
    },
    [RiskLevel.OVERDUE]: {
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      icon: <TimerOutlined sx={{ fontSize: 14 }} />,
      label: 'Overdue',
    },
  }[deadline.riskLevel];

  return (
    <div className={`flex flex-col gap-1 ${deadline.isCountdownActive ? 'scale-105 origin-left' : ''}`}>
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${config.color}`}>
        {config.icon}
        <span>{config.label}</span>
        {deadline.stasisStatus === StasisStatus.ACTIVE && (
          <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-current opacity-70">
            <AcUnitOutlined sx={{ fontSize: 12 }} className="animate-pulse" />
            <span>Frozen</span>
          </div>
        )}
      </div>
      
      {deadline.isCountdownActive && (
        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 animate-pulse flex items-center gap-1">
          <TimerOutlined sx={{ fontSize: 10 }} />
          <span>{deadline.effectiveDaysRemaining} Days to Event</span>
        </div>
      )}
    </div>
  );
};
