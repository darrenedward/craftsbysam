


import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../../hooks/useStore';
import { Product, CustomizationOption, Category } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { generateDescription } from '../../services/geminiService';
import { Modal } from '../ui/Modal';
import ImageManager from './ImageManager';
import { formatError } from '../../utils/errorHelper';

type SortKey = 'name' | 'price' | 'stock' | 'category' | 'created_at';

const ProductManager = () => {
    const { products, categories, deleteProduct, showToast } = useStore();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    // Ref to scroll to top of component
    const topRef = useRef<HTMLDivElement>(null);

    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...products];

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.subcategory?.category.id === selectedCategory);
        }
        
        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(lowercasedTerm) ||
                (p.subcategory?.category.name.toLowerCase().includes(lowercasedTerm)) ||
                (p.subcategory?.name.toLowerCase().includes(lowercasedTerm))
            );
        }

        const sorted = filtered.sort((a, b) => {
            let valA: any, valB: any;
            if (sortKey === 'category') {
                valA = a.subcategory?.category.name || '';
                valB = b.subcategory?.category.name || '';
            } else {
                valA = a[sortKey] || '';
                valB = b[sortKey] || '';
            }
            
            if (typeof valA === 'string' && typeof valB === 'string') {
                 return valA.localeCompare(valB);
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return valA - valB;
            }
            return 0;
        });

        if (sortOrder === 'desc') {
            return sorted.reverse();
        }
        return sorted;
    }, [products, sortKey, sortOrder, searchTerm, selectedCategory]);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormVisible(true);
        // Scroll to the top of the product manager where the form is
        setTimeout(() => {
            topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsFormVisible(true);
        setTimeout(() => {
            topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    const handleDelete = async (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product? This will permanently remove it from the database.')) {
            try {
                await deleteProduct(productId);
                showToast("Product deleted successfully.", 'success');
            } catch (error) {
                console.error("Failed to delete product:", error);
                showToast(`Error deleting product: ${formatError(error)}`, 'error');
            }
        }
    };
    
    const handleFormClose = () => {
        setIsFormVisible(false);
        setEditingProduct(null);
    }

    const toggleSortOrder = () => {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };

    return (
        <div ref={topRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-brand-text">Product Management</h2>
                <Button onClick={handleAddNew}>Add New Product</Button>
            </div>

            {isFormVisible && <ProductForm product={editingProduct} onDone={handleFormClose} />}
            
            <div className="my-6 p-4 bg-gray-50 rounded-lg border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="lg:col-span-2">
                    <Input 
                        label="Search Products"
                        id="search-products"
                        placeholder="Filter by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <div>
                    <label htmlFor="category-filter" className="block text-sm font-medium text-brand-light-text mb-1">Category</label>
                    <select 
                        id="category-filter"
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text h-10"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end gap-2">
                    <div className="flex-grow">
                        <label htmlFor="sort-key" className="block text-sm font-medium text-brand-light-text mb-1">Sort by</label>
                        <select 
                            id="sort-key"
                            value={sortKey} 
                            onChange={(e) => setSortKey(e.target.value as SortKey)}
                            className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text h-10"
                        >
                            <option value="name">Name</option>
                            <option value="category">Category</option>
                            <option value="price">Price</option>
                            <option value="stock">Stock</option>
                            <option value="created_at">Date Created</option>
                        </select>
                    </div>
                    <Button variant="secondary" onClick={toggleSortOrder} className="h-10 px-3">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {filteredAndSortedProducts.length > 0 ? (
                    filteredAndSortedProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-4 border border-brand-border rounded-lg">
                            <div className="flex items-center">
                                <img src={product.imageUrl || 'https://placehold.co/100x100/f8cadd/4a5568?text=No+Image'} alt={product.name} className="w-16 h-16 object-cover rounded-md mr-4"/>
                                <div>
                                    <p className="font-semibold">{product.name}</p>
                                    <p className="text-sm text-brand-light-text">
                                        ${product.price.toFixed(2)} - Stock: {product.stock}
                                        {(product.lowStockThreshold != null && product.stock <= product.lowStockThreshold) && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                                                Low Stock
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Category: {product.subcategory?.category.name}{product.subcategory ? ` > ${product.subcategory.name}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="space-x-2">
                                <Button variant="secondary" onClick={() => handleEdit(product)}>Edit</Button>
                                <Button variant="danger" onClick={() => handleDelete(product.id)}>Delete</Button>
                            </div>
                        </div>
                    ))
                ) : (
                     <div className="text-center py-10 text-brand-light-text border-2 border-dashed rounded-lg">
                        <p className="font-semibold">No Products Found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProductForm: React.FC<{ product: Product | null, onDone: () => void }> = ({ product, onDone }) => {
    const { addProduct, updateProduct, categories, subcategories, showToast, settings } = useStore();
    
    type FormData = Omit<Product, 'id' | 'created_at' | 'subcategory'> & { subcategory_id: string | null };

    // Initialize state with a deep copy of customizations to avoid mutation issues
    const [formData, setFormData] = useState<FormData>(() => {
        const defaults = {
            name: '', description: '', price: 0, imageUrl: '', stock: 0, isFeatured: false, subcategory_id: null, customizations: [], lowStockThreshold: 10, discountPrice: undefined, shippingCost: 0
        };
        if (product) {
            // Deep copy including customizations array
            const customizationsCopy = product.customizations ? JSON.parse(JSON.stringify(product.customizations)) : [];
            
            // Migrate legacy data: if type='text' and no lineLengths, create it from maxLength
            customizationsCopy.forEach((c: CustomizationOption) => {
                if (c.type === 'text' && (!c.lineLengths || c.lineLengths.length === 0)) {
                    c.lineLengths = [c.maxLength || 20];
                }
            });

            return { 
                ...product, 
                customizations: customizationsCopy, 
                subcategory_id: product.subcategory?.id || null, 
                shippingCost: product.shippingCost || 0 
            };
        }
        return defaults;
    });

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(product?.subcategory?.category.id || null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const availableSubcategories = useMemo(() => {
        if (!selectedCategoryId) return [];
        return subcategories.filter(s => s.category_id === selectedCategoryId);
    }, [selectedCategoryId, subcategories]);

    useEffect(() => {
        // If the product being edited has a category, set it in the state
        if (product?.subcategory?.category.id) {
            setSelectedCategoryId(product.subcategory.category.id);
        }
    }, [product]);

    useEffect(() => {
        // When category changes, reset subcategory if it's no longer valid
        if (selectedCategoryId && !availableSubcategories.some(s => s.id === formData.subcategory_id)) {
            setFormData(prev => ({ ...prev, subcategory_id: null }));
        }
    }, [selectedCategoryId, availableSubcategories, formData.subcategory_id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             setFormData(prev => ({...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
             setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value }));
        }
    };

    const handleCustomizationChange = (index: number, field: keyof CustomizationOption, value: any) => {
        const custId = formData.customizations?.[index]?.id;
        if (!custId) return;
        const errorKey = field === 'options' ? `${custId}-options` : custId;
         if (errors[errorKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
        
        const newCustomizations = JSON.parse(JSON.stringify(formData.customizations || []));
        (newCustomizations[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, customizations: newCustomizations }));
    };

    // Specific handler for line lengths to keep logic clean
    const handleLineLengthChange = (custIndex: number, lineIndex: number, value: number) => {
        const newCustomizations = JSON.parse(JSON.stringify(formData.customizations || []));
        const lengths = newCustomizations[custIndex].lineLengths || [20];
        lengths[lineIndex] = value;
        newCustomizations[custIndex].lineLengths = lengths;
        setFormData(prev => ({ ...prev, customizations: newCustomizations }));
    };
    
    const addLine = (custIndex: number) => {
        const newCustomizations = JSON.parse(JSON.stringify(formData.customizations || []));
        const lengths = newCustomizations[custIndex].lineLengths || [20];
        lengths.push(20); // Default new line to 20 chars
        newCustomizations[custIndex].lineLengths = lengths;
        setFormData(prev => ({ ...prev, customizations: newCustomizations }));
    };
    
    const removeLine = (custIndex: number, lineIndex: number) => {
        const newCustomizations = JSON.parse(JSON.stringify(formData.customizations || []));
        const lengths = newCustomizations[custIndex].lineLengths || [20];
        if (lengths.length > 1) {
            lengths.splice(lineIndex, 1);
            newCustomizations[custIndex].lineLengths = lengths;
            setFormData(prev => ({ ...prev, customizations: newCustomizations }));
        }
    };

    const addCustomization = () => {
        setFormData(prev => ({
            ...prev,
            customizations: [
                ...(prev.customizations || []),
                { 
                    id: `cust${Date.now()}`, 
                    name: '', 
                    type: 'text', 
                    required: false, 
                    maxLength: 20, // Default fallback
                    lineLengths: [20], // Default 1 line
                    helperText: '' 
                }
            ]
        }));
    };

    const removeCustomization = (id: string) => {
        setFormData(prev => ({
            ...prev,
            customizations: (prev.customizations || []).filter(c => c.id !== id)
        }));
    };
    
    const handleGenerateDescription = async () => {
        if (!formData.name) {
            showToast("Please enter a product name first to generate a description.", 'info');
            return;
        }
        
        if (!settings?.ai?.enabled) {
             showToast("AI features are disabled. Please enable them in Settings > AI Integration.", 'error');
             return;
        }

        setIsGenerating(true);
        const categoryName = categories.find(c => c.id === selectedCategoryId)?.name || '';
        const subcategoryName = subcategories.find(s => s.id === formData.subcategory_id)?.name || '';
        const keywords = `${formData.name}, ${categoryName}, ${subcategoryName}`;
        
        const description = await generateDescription(
            keywords, 
            settings.ai?.apiKey, 
            settings.ai?.model
        );
        setFormData(prev => ({ ...prev, description }));
        setIsGenerating(false);
    };

    const handleImageSelect = (url: string) => {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        setIsImageModalOpen(false);
    };
    
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        (formData.customizations || []).forEach(cust => {
            if (!cust.name.trim()) {
                newErrors[cust.id] = "Option Name is required.";
            }
            if (cust.type === 'select' && (!cust.options || cust.options.join('').trim() === '')) {
                newErrors[`${cust.id}-options`] = "Please provide at least one option (comma-separated).";
            }
        });

        const price = Number(formData.price);
        const discountPrice = Number(formData.discountPrice);

        if (formData.discountPrice != null && typeof formData.discountPrice === 'number' && !isNaN(discountPrice) && discountPrice > price) {
             newErrors.discountPrice = "Discount price must be less than or equal to the regular price.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        
        setIsSaving(true);
        
        const cleanPayload = {
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            discountPrice: (formData.discountPrice !== undefined && formData.discountPrice !== null && !isNaN(Number(formData.discountPrice))) ? Number(formData.discountPrice) : null,
            imageUrl: formData.imageUrl,
            stock: Number(formData.stock),
            shippingCost: (formData.shippingCost !== undefined && formData.shippingCost !== null && !isNaN(Number(formData.shippingCost))) ? Number(formData.shippingCost) : 0,
            lowStockThreshold: (formData.lowStockThreshold !== undefined && formData.lowStockThreshold !== null && !isNaN(Number(formData.lowStockThreshold))) ? Number(formData.lowStockThreshold) : null,
            isFeatured: formData.isFeatured,
            subcategory_id: formData.subcategory_id || null,
            customizations: formData.customizations || []
        };

        try {
            if (product) {
                await updateProduct({ ...cleanPayload, id: product.id });
                showToast("Product updated successfully!", 'success');
            } else {
                // @ts-ignore
                await addProduct(cleanPayload);
                showToast("New product added successfully!", 'success');
            }
            onDone();
        } catch (error: any) {
            console.error("Failed to save product:", error);
            showToast(`Failed to save product: ${formatError(error)}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 my-4 border border-brand-pink rounded-lg bg-pink-50">
            <Modal title="Select Product Image" isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)}>
                <ImageManager onSelectImage={handleImageSelect} />
            </Modal>

            <h3 className="text-lg font-semibold mb-4">{product ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} required />
                    <div>
                        <label className="block text-sm font-medium text-brand-light-text mb-1">Category</label>
                        <select 
                            value={selectedCategoryId || ''} 
                            onChange={e => setSelectedCategoryId(e.target.value)}
                            className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text h-10"
                        >
                            <option value="">Select a category...</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-light-text mb-1">Subcategory</label>
                        <select 
                            name="subcategory_id"
                            value={formData.subcategory_id || ''} 
                            onChange={handleChange}
                            disabled={!selectedCategoryId}
                            className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text h-10 disabled:bg-gray-100"
                        >
                            <option value="">Select a subcategory (optional)...</option>
                            {availableSubcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-brand-light-text mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text"></textarea>
                    <Button type="button" variant="secondary" className="text-xs mt-2 py-1" onClick={handleGenerateDescription} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : 'Generate with AI ✨'}
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Input label="Price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
                    <div>
                        <Input 
                            label="Discount Price" 
                            name="discountPrice" 
                            type="number" 
                            step="0.01" 
                            value={formData.discountPrice || ''} 
                            onChange={handleChange} 
                            placeholder="Optional"
                            className={errors.discountPrice ? 'border-red-500' : ''}
                        />
                        {errors.discountPrice && <p className="text-red-500 text-xs mt-1">{errors.discountPrice}</p>}
                    </div>
                    <Input label="Shipping Cost" name="shippingCost" type="number" step="0.01" value={formData.shippingCost || ''} onChange={handleChange} placeholder="e.g., 5.00" />
                    <Input label="Stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
                    <Input label="Low Stock Threshold" name="lowStockThreshold" type="number" value={formData.lowStockThreshold || ''} onChange={handleChange} placeholder="e.g., 10" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-light-text mb-1">Product Image</label>
                    <div className="flex items-center gap-4">
                        <img 
                            src={formData.imageUrl || 'https://placehold.co/100x100/f8cadd/4a5568?text=No+Image'} 
                            alt="Product preview" 
                            className="w-20 h-20 object-cover rounded-md border border-brand-border"
                        />
                        <Button type="button" variant="secondary" onClick={() => setIsImageModalOpen(true)}>Select Image</Button>
                    </div>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="h-4 w-4 text-brand-pink border-gray-300 rounded focus:ring-brand-pink"/>
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-brand-text">Featured Product</label>
                </div>
                
                <div className="border-t pt-4 mt-4">
                    <h4 className="text-md font-semibold mb-2 text-brand-text">Customization Options</h4>
                    <div className="space-y-4">
                        {(formData.customizations || []).map((cust, index) => (
                            <div key={cust.id} className="p-4 border rounded-lg bg-white space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Input label="Option Name *" name="name" value={cust.name} onChange={e => handleCustomizationChange(index, 'name', e.target.value)} placeholder="e.g., Custom Text" className={errors[cust.id] ? 'border-red-500' : ''}/>
                                        {errors[cust.id] && <p className="text-red-500 text-xs mt-1">{errors[cust.id]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-brand-light-text mb-1">Type</label>
                                        <select value={cust.type} onChange={e => handleCustomizationChange(index, 'type', e.target.value)} className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text">
                                            <option value="text">Text Input</option>
                                            <option value="select">Select Dropdown</option>
                                            <option value="color">Color Picker</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {cust.type === 'color' ? "Use 'Select' for specific vinyl colors." : ""}
                                        </p>
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <input type="checkbox" id={`required-${index}`} checked={cust.required} onChange={e => handleCustomizationChange(index, 'required', e.target.checked)} className="h-4 w-4 text-brand-pink border-gray-300 rounded focus:ring-brand-pink"/>
                                        <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-brand-text">Required</label>
                                    </div>
                                </div>
                                
                                <div className="mt-2">
                                    <Input 
                                        label="Helper Instructions" 
                                        name="helperText" 
                                        value={cust.helperText || ''} 
                                        onChange={e => handleCustomizationChange(index, 'helperText', e.target.value)} 
                                        placeholder="e.g. Max 10 chars if choosing Large Font" 
                                    />
                                </div>

                                {cust.type === 'text' && (
                                    <div className="mt-4 border-t pt-2 border-dashed">
                                        <label className="block text-sm font-medium text-brand-text mb-2">Lines Configuration</label>
                                        <div className="space-y-2">
                                            {(cust.lineLengths || [20]).map((limit, lineIdx) => (
                                                <div key={lineIdx} className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-500 w-12">Line {lineIdx + 1}</span>
                                                    <div className="flex-grow">
                                                        <Input 
                                                            label={`Max Chars`} 
                                                            type="number" 
                                                            value={limit} 
                                                            onChange={e => handleLineLengthChange(index, lineIdx, parseInt(e.target.value))} 
                                                            placeholder="e.g. 20" 
                                                            className="py-1"
                                                        />
                                                    </div>
                                                    {(cust.lineLengths?.length || 0) > 1 && (
                                                        <div className="pt-6">
                                                            <Button type="button" variant="danger" onClick={() => removeLine(index, lineIdx)} className="py-1 px-2 text-xs">Remove</Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3">
                                            <Button type="button" variant="secondary" onClick={() => addLine(index)} className="text-xs py-1">+ Add Line</Button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Add multiple lines to match the physical constraints of the product.</p>
                                    </div>
                                )}
                                {cust.type === 'select' && (
                                    <div className="mt-2">
                                        <label className="block text-sm font-medium text-brand-light-text mb-1">Options (comma-separated)</label>
                                        <textarea value={cust.options?.join(', ') || ''} onChange={e => handleCustomizationChange(index, 'options', e.target.value.split(',').map(s => s.trim()))} rows={2} className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink sm:text-sm bg-white text-brand-text ${errors[`${cust.id}-options`] ? 'border-red-500' : 'border-brand-border'}`}></textarea>
                                        {errors[`${cust.id}-options`] && <p className="text-red-500 text-xs mt-1">{errors[`${cust.id}-options`]}</p>}
                                        <p className="text-xs text-gray-500 mt-1">Use this for Vinyl Colors (e.g. Gold, Silver) or Fonts (e.g. Cursive, Block).</p>
                                    </div>
                                )}
                                <div className="text-right mt-2">
                                    <Button type="button" variant="danger" onClick={() => removeCustomization(cust.id)} className="text-xs py-1">Remove Option</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="secondary" onClick={addCustomization} className="mt-4">Add Customization Option</Button>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onDone}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : (product ? 'Save Changes' : 'Add Product')}
                    </Button>
                </div>
            </form>
        </div>
    )
};

export default ProductManager;