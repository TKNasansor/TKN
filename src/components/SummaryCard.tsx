import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color, path }) => {
  return (
    <Link 
      to={path}
      className={`${color} p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  );
};

export default SummaryCard;