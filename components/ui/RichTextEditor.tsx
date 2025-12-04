
import React, { useState } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import ImageManager from '../admin/ImageManager';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const insertTag = (tag: string) => {
        const textArea = document.getElementById('html-editor') as HTMLTextAreaElement;
        if (!textArea) return;

        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const text = textArea.value;
        const selectedText = text.substring(start, end);
        
        let replacement = '';
        if (tag === 'b') replacement = `<b>${selectedText}</b>`;
        else if (tag === 'i') replacement = `<i>${selectedText}</i>`;
        else if (tag === 'h2') replacement = `<h2>${selectedText}</h2>`;
        else if (tag === 'h3') replacement = `<h3>${selectedText}</h3>`;
        else if (tag === 'p') replacement = `<p>${selectedText}</p>`;
        else if (tag === 'br') replacement = `<br>`;
        
        const newText = text.substring(0, start) + replacement + text.substring(end);
        onChange(newText);
        
        // Restore focus
        setTimeout(() => {
            textArea.focus();
            textArea.selectionStart = start + replacement.length;
            textArea.selectionEnd = start + replacement.length;
        }, 0);
    };

    const handleImageSelect = (url: string) => {
        const imgTag = `<img src="${url}" alt="About Us Image" class="w-full rounded-lg my-4 shadow-md" />`;
        const textArea = document.getElementById('html-editor') as HTMLTextAreaElement;
        if (textArea) {
            const start = textArea.selectionStart;
            const end = textArea.selectionEnd;
            const text = textArea.value;
            const newText = text.substring(0, start) + imgTag + text.substring(end);
            onChange(newText);
        }
        setIsImageModalOpen(false);
    };

    return (
        <div className="border border-brand-border rounded-lg overflow-hidden bg-white">
            <Modal title="Select Image" isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)}>
                <ImageManager onSelectImage={handleImageSelect} />
            </Modal>

            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-brand-border p-2 flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => insertTag('b')} className="px-3 py-1 text-sm font-bold">B</Button>
                <Button type="button" variant="secondary" onClick={() => insertTag('i')} className="px-3 py-1 text-sm italic">I</Button>
                <div className="w-px bg-gray-300 mx-1"></div>
                <Button type="button" variant="secondary" onClick={() => insertTag('h2')} className="px-3 py-1 text-sm">H2</Button>
                <Button type="button" variant="secondary" onClick={() => insertTag('h3')} className="px-3 py-1 text-sm">H3</Button>
                <Button type="button" variant="secondary" onClick={() => insertTag('p')} className="px-3 py-1 text-sm">Paragraph</Button>
                <Button type="button" variant="secondary" onClick={() => insertTag('br')} className="px-3 py-1 text-sm">Break</Button>
                <div className="w-px bg-gray-300 mx-1"></div>
                <Button type="button" variant="secondary" onClick={() => setIsImageModalOpen(true)} className="px-3 py-1 text-sm flex items-center gap-1">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     Insert Image
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Editor */}
                <div className="p-0">
                     <textarea 
                        id="html-editor"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-96 p-4 focus:outline-none resize-none font-mono text-sm bg-white text-brand-text"
                        placeholder="Type your content here..."
                     />
                </div>
                
                {/* Preview */}
                <div className="border-l border-brand-border bg-gray-50 p-4 overflow-y-auto h-96">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Live Preview</p>
                    <div className="prose max-w-none text-brand-text">
                        {/* Use standard styling similar to storefront */}
                        <div dangerouslySetInnerHTML={{ __html: value }} />
                        <style>{`
                            .prose h2 { font-size: 1.5rem; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; color: #5C374C; }
                            .prose h3 { font-size: 1.25rem; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; color: #5C374C; }
                            .prose p { margin-bottom: 1em; line-height: 1.6; }
                            .prose img { max-width: 100%; height: auto; border-radius: 0.5rem; }
                        `}</style>
                    </div>
                </div>
            </div>
        </div>
    );
};
