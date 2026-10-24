import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Tag,
  Zap,
  GraduationCap,
  HeartPulse,
  Film,
  Sparkles,
  Home,
  Repeat,
  Plane,
  MoreHorizontal,
} from 'lucide-react';
import { CategoryName } from '../types/expense';

interface CategoryIconProps {
  category: CategoryName | string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = 'w-4 h-4',
  size = 16,
}) => {
  switch (category) {
    case 'Food & Drinks':
      return <Utensils size={size} className={className} />;
    case 'Transport':
      return <Car size={size} className={className} />;
    case 'Groceries':
      return <ShoppingBag size={size} className={className} />;
    case 'Shopping':
      return <Tag size={size} className={className} />;
    case 'Bills & Utilities':
      return <Zap size={size} className={className} />;
    case 'Education':
      return <GraduationCap size={size} className={className} />;
    case 'Health':
      return <HeartPulse size={size} className={className} />;
    case 'Entertainment':
      return <Film size={size} className={className} />;
    case 'Personal Care':
      return <Sparkles size={size} className={className} />;
    case 'Rent':
      return <Home size={size} className={className} />;
    case 'Subscriptions':
      return <Repeat size={size} className={className} />;
    case 'Travel':
      return <Plane size={size} className={className} />;
    default:
      return <MoreHorizontal size={size} className={className} />;
  }
};
