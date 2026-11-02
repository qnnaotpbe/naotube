/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CATEGORIES } from '../services/mockData';

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="sticky top-14 z-20 bg-[#0F0F0F]/95 backdrop-blur-md px-4 py-3 border-b border-[#222222]">
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-accent text-white shadow-sm shadow-[#FF5500]/20'
                  : 'bg-[#222222] text-[#E0E0E0] hover:bg-[#2F2F2F] hover:text-white'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};
