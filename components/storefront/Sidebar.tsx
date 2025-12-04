
import React from 'react';
import { useStore } from '../../hooks/useStore';
import { CategoryIcon, SubcategoryIcon } from '../ui/CategoryIcons';

interface SidebarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedFilter: { type: 'category' | 'subcategory' | 'featured', id: string } | null;
  onFilterSelect: (filter: { type: 'category' | 'subcategory' | 'featured', id: string } | null) => void;
}

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const AllProductsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ searchTerm, onSearchChange, selectedFilter, onFilterSelect }) => {
  const { categories, subcategories } = useStore();

  return (
    <aside className="w-full md:w-1/4 lg:w-1/5 md:-ml-10">
      <div className="sticky top-28 space-y-8">
        {/* Search Input */}
        <div>
          <label htmlFor="search-store" className="text-lg font-semibold text-brand-text mb-2 block">Search</label>
          <input
            id="search-store"
            type="text"
            placeholder="Find a product..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text"
          />
        </div>
        
        {/* Category List */}
        <div>
           <h3 className="text-lg font-semibold text-brand-text mb-2">Categories</h3>
            <ul className="space-y-2">
                <li>
                    <button
                        onClick={() => onFilterSelect(null)}
                        className={`w-full text-left text-brand-header hover:text-brand-dark-pink transition-colors text-lg flex items-center gap-2 ${!selectedFilter ? 'font-bold text-brand-dark-pink' : ''}`}
                    >
                        <AllProductsIcon />
                        <span>All Products</span>
                    </button>
                </li>
                <li>
                     <button
                        onClick={() => onFilterSelect({ type: 'featured', id: 'featured' })}
                        className={`w-full text-left text-brand-header hover:text-brand-dark-pink transition-colors text-lg flex items-center gap-2 ${selectedFilter?.type === 'featured' ? 'font-bold text-brand-dark-pink' : ''}`}
                    >
                        <StarIcon />
                        <span>Featured Products</span>
                    </button>
                </li>
                {categories.map(cat => {
                    const childSubcategories = subcategories.filter(s => s.category_id === cat.id);
                    const isMainActive = selectedFilter?.type === 'category' && selectedFilter.id === cat.id;
                    return (
                        <li key={cat.id}>
                            <button
                                onClick={() => onFilterSelect({ type: 'category', id: cat.id })}
                                className={`w-full text-left text-brand-header hover:text-brand-dark-pink transition-colors text-lg flex items-center gap-2 ${isMainActive ? 'font-bold text-brand-dark-pink' : ''}`}
                            >
                                <CategoryIcon name={cat.name} />
                                <span>{cat.name}</span>
                            </button>
                            {childSubcategories.length > 0 && (
                                <ul className="pl-4 mt-2 space-y-2">
                                    {childSubcategories.map(sub => {
                                        const isSubActive = selectedFilter?.type === 'subcategory' && selectedFilter.id === sub.id;
                                        return (
                                            <li key={sub.id}>
                                                <button
                                                    onClick={() => onFilterSelect({ type: 'subcategory', id: sub.id })}
                                                    className={`w-full text-left text-brand-light-text hover:text-brand-dark-pink transition-colors text-base flex items-center gap-2 ${isSubActive ? 'font-bold text-brand-dark-pink' : ''}`}
                                                >
                                                    <SubcategoryIcon />
                                                    <span>{sub.name}</span>
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
