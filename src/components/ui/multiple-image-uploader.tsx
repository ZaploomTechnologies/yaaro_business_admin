'use client';

import { useState, useRef } from 'react';
import { IconPhoto, IconX, IconUpload, IconPlus } from '@tabler/icons-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { cn, getImageUrl } from '@/lib/utils';

interface MultipleImageUploaderProps {
    value?: string[]; // Array of image URLs
    onChange: (urls: string[]) => void;
    onUpload?: (file: File) => Promise<string>;
    label?: string;
    required?: boolean;
    accept?: string;
    maxSize?: number; // Max size per file in MB
    maxImages?: number;
    className?: string;
}

export function MultipleImageUploader({
    value = [],
    onChange,
    onUpload,
    label = 'Images',
    required = false,
    accept = 'image/*',
    maxSize = 5,
    maxImages = 5,
    className
}: MultipleImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (value.length + files.length > maxImages) {
            toast.error(`You can only upload up to ${maxImages} images`);
            return;
        }

        setUploading(true);
        const newUrls = [...value];

        try {
            for (const file of files) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not a valid image file. Skipping.`);
                    continue;
                }

                // Validate file size
                const fileSizeMB = file.size / (1024 * 1024);
                if (fileSizeMB > maxSize) {
                    toast.error(`${file.name} exceeds ${maxSize}MB limit. Skipping.`);
                    continue;
                }

                let tempUrl = '';
                if (onUpload) {
                    tempUrl = await onUpload(file);
                } else {
                    const formData = new FormData();
                    formData.append('image', file);
                    const response = await apiClient.post<any>('/business/uploadImage', formData);
                    if (response.success && response.data?.url) {
                        tempUrl = response.data.url;
                    } else {
                        throw new Error(`Upload failed for ${file.name}`);
                    }
                }

                if (tempUrl) {
                    newUrls.push(tempUrl);
                }
            }

            onChange(newUrls);
            toast.success('Images uploaded successfully');
        } catch (error: any) {
            console.error('Upload Error:', error);
            toast.error(error.message || 'Failed to upload images');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = (index: number) => {
        const newUrls = [...value];
        newUrls.splice(index, 1);
        onChange(newUrls);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={cn('space-y-3', className)}>
            {label && (
                <Label>
                    {label} {required && <span className='text-red-500'>*</span>}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({value.length}/{maxImages})
                    </span>
                </Label>
            )}

            <div className='flex flex-wrap gap-4'>
                {/* Add Button - placed first as requested */}
                {value.length < maxImages && (
                    <button
                        type="button"
                        onClick={handleClick}
                        disabled={uploading}
                        className={cn(
                            'flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-all hover:border-primary/50 hover:bg-muted/50 active:scale-95',
                            uploading && 'cursor-not-allowed opacity-50'
                        )}
                    >
                        {uploading ? (
                            <span className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        ) : (
                            <>
                                <IconPlus className='h-8 w-8 text-muted-foreground' />
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Add Image</span>
                            </>
                        )}
                    </button>
                )}

                {/* Previews */}
                {value.map((url, index) => (
                    <div key={`${url}-${index}`} className='group relative'>
                        <div className='h-24 w-24 overflow-hidden rounded-lg border bg-muted shadow-sm transition-transform hover:scale-[1.02]'>
                            <img 
                                src={getImageUrl(url)} 
                                alt={`Preview ${index + 1}`} 
                                className="h-full w-full object-cover" 
                            />
                        </div>
                        <Button
                            type='button'
                            variant='destructive'
                            size='icon'
                            className='absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100'
                            onClick={() => handleRemove(index)}
                        >
                            <IconX className='h-3 w-3' />
                        </Button>
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                             <IconPhoto className="h-6 w-6 text-white/70" />
                        </div>
                    </div>
                ))}

                <input
                    ref={fileInputRef}
                    type='file'
                    multiple
                    accept={accept}
                    onChange={handleFileSelect}
                    className='hidden'
                    disabled={uploading}
                />
            </div>
            <p className='text-xs text-muted-foreground'>
                Up to {maxImages} images. Max {maxSize}MB each.
            </p>
        </div>
    );
}
