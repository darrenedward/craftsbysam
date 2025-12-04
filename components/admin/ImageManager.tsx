
import React, { useState, useEffect, useMemo } from 'react';
import { supabase, supabaseUrl } from '../../supabaseClient';
import { Button } from '../ui/Button';
import { useStore } from '../../hooks/useStore';
import { Modal } from '../ui/Modal';
import { formatError } from '../../utils/errorHelper';

const BUCKET_NAME = 'product-images';

// FIX: The type `FileObject` is not exported from `@supabase/supabase-js` in this project's version, causing a build error.
// It is defined here locally to match the expected structure from Supabase Storage.
interface FileObject {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, any>;
}

interface ImageManagerProps {
  onSelectImage?: (url: string) => void;
}

type SortKey = 'name' | 'created_at';

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const ImageManager: React.FC<ImageManagerProps> = ({ onSelectImage }) => {
    const { showToast } = useStore();
    const [images, setImages] = useState<FileObject[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ name: string | null }>({ name: null });
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const sortedImages = useMemo(() => {
        return [...images].sort((a, b) => {
            let comparison = 0;
            if (sortKey === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortKey === 'created_at' && a.created_at && b.created_at) {
                comparison = a.created_at.localeCompare(b.created_at);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [images, sortKey, sortOrder]);

    const fetchImages = async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

        if (error) {
            console.error('Error fetching images:', error);
            setError(`Could not fetch images. ${formatError(error)}`);
        } else {
            setImages(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const getPublicUrl = (filename: string): string => {
        // DEFINITIVE FIX: Manually construct the public URL.
        // The official `getPublicUrl` helper from the SDK was proving unreliable.
        // This direct construction method is foolproof for public buckets.
        return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress({ name: file.name });
        setError(null);
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file);

        if (uploadError) {
            const errMsg = formatError(uploadError);
            setError(errMsg);
            showToast(`Error uploading image: ${errMsg}`, 'error');
            console.error('Error uploading image:', uploadError);
        } else {
            // Use unshift to add the new image to the top of the list for immediate feedback
            const newImage: FileObject = { id: fileName, name: fileName, created_at: new Date().toISOString() };
            setImages(prev => [newImage, ...prev]);
            showToast("Image uploaded successfully", 'success');
        }
        setUploading(false);
        setUploadProgress({ name: null });
        event.target.value = '';
    };

    const handleDelete = async (imageName: string) => {
        if (!window.confirm(`Are you sure you want to delete ${imageName}? This cannot be undone.`)) return;

        const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove([imageName]);

        if (deleteError) {
            const errMsg = formatError(deleteError);
            setError(errMsg);
            showToast(`Error deleting image: ${errMsg}`, 'error');
            console.error('Error deleting image:', deleteError);
        } else {
            setImages(images.filter(img => img.name !== imageName));
            showToast("Image deleted successfully", 'success');
        }
    };
    
    const UploadButton = () => (
        <div className="relative">
             <Button type="button" disabled={uploading} aria-label="Upload new image">
                {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={handleUpload} 
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-inner">
            {previewImage && (
                <Modal title="Image Preview" isOpen={!!previewImage} onClose={() => setPreviewImage(null)}>
                    <img src={previewImage} alt="Preview" className="max-w-full max-h-[75vh] mx-auto rounded-lg" />
                </Modal>
            )}

            <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className="text-xl font-bold text-brand-text">
                    {onSelectImage ? 'Select an Image' : 'Image Manager'}
                </h2>
                <UploadButton />
            </div>

            {uploading && uploadProgress.name && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">Uploading: <span className="font-medium">{uploadProgress.name}</span></p>
                    <div className="relative w-full h-2 bg-blue-100 rounded-full mt-2 overflow-hidden">
                        <div className="absolute h-full bg-blue-500 w-full animate-pulse"></div>
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-sm">{error}</p>}
            
            {!loading && images.length > 0 && (
                 <div className="my-4 p-4 bg-gray-50 rounded-lg border flex items-center justify-end gap-4">
                    <label htmlFor="sort-key" className="text-sm font-medium text-brand-light-text">Sort by:</label>
                    <select 
                        id="sort-key"
                        value={sortKey} 
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                        className="block w-40 px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text"
                    >
                        <option value="created_at">Date Created</option>
                        <option value="name">Image Name</option>
                    </select>
                    <Button variant="secondary" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="w-28">
                        {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                    </Button>
                </div>
            )}

            {loading ? (
                <p className="text-center py-8">Loading images...</p>
            ) : images.length === 0 ? (
                <div className="text-center text-brand-light-text py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                    <h3 className="text-lg font-semibold text-brand-text">No Images Found in Storage</h3>
                    <p className="mt-2">Your <code className="text-xs bg-gray-200 p-1 rounded">'product-images'</code> bucket is empty.</p>
                    <p className="mt-1">Upload your first image to see it here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {sortedImages.map(image => (
                        <div 
                            key={image.id} 
                            className="group relative border rounded-lg overflow-hidden aspect-square cursor-pointer"
                            onClick={() => setPreviewImage(getPublicUrl(image.name))}
                        >
                            <img src={getPublicUrl(image.name)} alt={image.name} className="w-full h-full object-cover bg-gray-100" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex flex-col justify-end p-2 text-white">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-xs font-mono break-all truncate mb-1">{image.name}</p>
                                    <div className="mt-1 flex flex-wrap gap-2 justify-center">
                                        {onSelectImage && (
                                            <button 
                                                type="button" 
                                                className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded shadow-md transition-colors flex items-center justify-center" 
                                                onClick={(e) => { e.stopPropagation(); onSelectImage(getPublicUrl(image.name)); }}
                                                title="Select"
                                            >
                                                <CheckIcon />
                                            </button>
                                        )}
                                        <button 
                                            type="button" 
                                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow-md transition-colors flex items-center justify-center" 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(image.name); }}
                                            title="Delete"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default ImageManager;
