
import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Category, Subcategory } from '../../types';
import { Modal } from '../ui/Modal';
import { formatError } from '../../utils/errorHelper';

const CategoryManager = () => {
    const { 
        categories, 
        subcategories, 
        products,
        addCategory, 
        updateCategory, 
        deleteCategory, 
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        showToast
    } = useStore();

    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
    const [activeCategoryForSub, setActiveCategoryForSub] = useState<Category | null>(null);
    const [newSubcategoryName, setNewSubcategoryName] = useState('');
    const [isSavingSubcategory, setIsSavingSubcategory] = useState(false);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
    
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setIsSavingCategory(true);
        try {
            await addCategory(newCategoryName.trim());
            setNewCategoryName('');
            showToast("Category added successfully", 'success');
        } catch (error) {
            console.error(error);
            showToast(`Failed to add category: ${formatError(error)}`, 'error');
        } finally {
            setIsSavingCategory(false);
        }
    };
    
    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory || !editingCategory.name.trim()) return;
        setIsSavingCategory(true);
        try {
            await updateCategory(editingCategory.id, editingCategory.name.trim());
            setEditingCategory(null);
            showToast("Category updated successfully", 'success');
        } catch (error) {
            console.error(error);
            showToast(`Failed to update category: ${formatError(error)}`, 'error');
        } finally {
            setIsSavingCategory(false);
        }
    };
    
    const handleDeleteCategory = async (category: Category) => {
        const subcategoryCount = subcategories.filter(s => s.category_id === category.id).length;
        if (subcategoryCount > 0) {
            showToast(`Cannot delete "${category.name}". It has ${subcategoryCount} subcategories. Please remove them first.`, 'error');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the category "${category.name}"? This cannot be undone.`)) {
            try {
                await deleteCategory(category.id);
                showToast("Category deleted successfully", 'success');
            } catch (error) {
                console.error(error);
                showToast(`Failed to delete category: ${formatError(error)}`, 'error');
            }
        }
    };
    
    // --- Subcategory Handlers ---
    
    const openSubcategoryModal = (category: Category, subcategory: Subcategory | null = null) => {
        setActiveCategoryForSub(category);
        setEditingSubcategory(subcategory);
        setNewSubcategoryName(subcategory ? subcategory.name : '');
        setIsSubcategoryModalOpen(true);
    };

    const closeSubcategoryModal = () => {
        setIsSubcategoryModalOpen(false);
        setActiveCategoryForSub(null);
        setEditingSubcategory(null);
        setNewSubcategoryName('');
    };

    const handleSubcategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubcategoryName.trim() || !activeCategoryForSub) return;
        setIsSavingSubcategory(true);
        try {
            if (editingSubcategory) {
                await updateSubcategory(editingSubcategory.id, newSubcategoryName.trim(), activeCategoryForSub.id);
                showToast("Subcategory updated successfully", 'success');
            } else {
                await addSubcategory(newSubcategoryName.trim(), activeCategoryForSub.id);
                showToast("Subcategory added successfully", 'success');
            }
            closeSubcategoryModal();
        } catch (error) {
            console.error(error);
            showToast(`Failed to save subcategory: ${formatError(error)}`, 'error');
        } finally {
            setIsSavingSubcategory(false);
        }
    };
    
    const handleDeleteSubcategory = async (subcategory: Subcategory) => {
        const productCount = products.filter(p => p.subcategory?.id === subcategory.id).length;
        if (productCount > 0) {
            showToast(`Cannot delete "${subcategory.name}". It is currently assigned to ${productCount} product(s).`, 'error');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the subcategory "${subcategory.name}"?`)) {
            try {
                await deleteSubcategory(subcategory.id);
                showToast("Subcategory deleted successfully", 'success');
            } catch (error) {
                console.error(error);
                showToast(`Failed to delete subcategory: ${formatError(error)}`, 'error');
            }
        }
    }


    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-8">
            {/* Main Category Form */}
            <div>
                <h2 className="text-xl font-bold text-brand-text mb-4">Manage Categories</h2>
                <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="flex gap-4 items-end p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-grow">
                        <Input 
                            label={editingCategory ? `Editing "${editingCategory.name}"` : "New Category Name"}
                            id="newCategoryName"
                            value={editingCategory ? editingCategory.name : newCategoryName}
                            onChange={e => editingCategory ? setEditingCategory({...editingCategory, name: e.target.value}) : setNewCategoryName(e.target.value)}
                            placeholder="e.g., Glassware"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isSavingCategory}>{isSavingCategory ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}</Button>
                    {editingCategory && <Button type="button" variant="secondary" onClick={() => setEditingCategory(null)}>Cancel</Button>}
                </form>
            </div>
            
            {/* Category List */}
            <div className="space-y-6">
                {categories.map(category => (
                    <div key={category.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-brand-text">{category.name}</h3>
                            <div className="space-x-2">
                                <Button variant="secondary" onClick={() => setEditingCategory(category)}>Edit Name</Button>
                                <Button variant="danger" onClick={() => handleDeleteCategory(category)}>Delete</Button>
                            </div>
                        </div>
                        <div className="mt-4 pl-4 border-l-2">
                            <h4 className="text-md font-semibold text-brand-light-text mb-2">Subcategories</h4>
                            <div className="space-y-2">
                                {subcategories.filter(s => s.category_id === category.id).map(sub => (
                                    <div key={sub.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <p>{sub.name}</p>
                                        <div className="space-x-2">
                                            <Button variant="secondary" className="text-xs py-1" onClick={() => openSubcategoryModal(category, sub)}>Edit</Button>
                                            <Button variant="danger" className="text-xs py-1" onClick={() => handleDeleteSubcategory(sub)}>Delete</Button>
                                        </div>
                                    </div>
                                ))}
                                 <Button variant="secondary" className="text-xs py-1" onClick={() => openSubcategoryModal(category)}>+ Add Subcategory</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

             <Modal 
                title={editingSubcategory ? `Edit Subcategory in "${activeCategoryForSub?.name}"` : `Add Subcategory to "${activeCategoryForSub?.name}"`} 
                isOpen={isSubcategoryModalOpen} 
                onClose={closeSubcategoryModal}
            >
                <form onSubmit={handleSubcategorySubmit} className="space-y-4">
                    <Input 
                        label="Subcategory Name"
                        id="newSubcategoryName"
                        value={newSubcategoryName}
                        onChange={e => setNewSubcategoryName(e.target.value)}
                        placeholder="e.g., Drinkware"
                        required
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={closeSubcategoryModal}>Cancel</Button>
                        <Button type="submit" disabled={isSavingSubcategory}>
                            {isSavingSubcategory ? 'Saving...' : (editingSubcategory ? 'Update Subcategory' : 'Add Subcategory')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CategoryManager;
