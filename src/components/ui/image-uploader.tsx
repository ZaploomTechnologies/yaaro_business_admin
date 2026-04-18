'use client';

import { useState, useRef, useEffect } from 'react';

import { IconPhoto, IconX, IconUpload } from '@tabler/icons-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { cn, getImageUrl } from '@/lib/utils';

interface ImageUploaderProps {
    value?: string; // Current image URL (for edit mode)
    onChange: (url: string) => void; // Callback with temp URL
    onUpload?: (file: File) => Promise<string>; // Optional custom upload logic
    label?: string;
    required?: boolean;
    accept?: string; // File types (default: "image/*")
    maxSize?: number; // Max file size in MB (default: 5)
    className?: string;
}

export function ImageUploader({
    value,
    onChange,
    onUpload,
    label = 'Image',
    required = false,
    accept = 'image/*',
    maxSize = 5,
    className
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update preview when value changes externally
    useEffect(() => {
        if (value) {
            setPreview(value);
        } else {
            setPreview(null);
        }
    }, [value]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            toast.error(`Image size must be less than ${maxSize}MB`);
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to temp folder
        setUploading(true);
        try {
            let tempUrl = '';
            
            if (onUpload) {
                tempUrl = await onUpload(file);
            } else {
                // Fallback to default upload endpoint if onUpload is not provided
                const formData = new FormData();
                formData.append('image', file);
                
                // Using the specific upload endpoint for brands/offers
                const response = await apiClient.post<any>('/business/uploadImage', formData);
                
                if (response.success && response.data?.url) {
                    tempUrl = response.data.url;
                } else {
                    throw new Error('Upload failed: Invalid response from server');
                }
            }

            if (tempUrl) {
                onChange(tempUrl);
                toast.success('Image uploaded successfully');
            }
        } catch (error: any) {
            console.error('Upload Error:', error);
            toast.error(error.message || 'Failed to upload image');
            setPreview(value || null); // Revert preview on error
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label htmlFor='image-upload'>
                    {label} {required && <span className='text-red-500'>*</span>}
                </Label>
            )}

            <div className='flex items-center gap-4'>
                {/* Preview */}
                {preview ? (
                    <div className='relative'>
                        <Avatar className='h-24 w-24'>
                            <AvatarImage src={getImageUrl(preview)} alt='Preview' />
                            <AvatarFallback>
                                <IconPhoto className='h-8 w-8' />
                            </AvatarFallback>
                        </Avatar>
                        {!uploading && (
                            <Button
                                type='button'
                                variant='destructive'
                                size='icon'
                                className='absolute -right-2 -top-2 h-6 w-6 rounded-full'
                                onClick={handleRemove}>
                                <IconX className='h-3 w-3' />
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className='flex h-24 w-24 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25'>
                        <IconPhoto className='h-8 w-8 text-muted-foreground' />
                    </div>
                )}

                {/* Upload Button */}
                <div className='flex flex-col gap-2'>
                    <input
                        ref={fileInputRef}
                        type='file'
                        id='image-upload'
                        accept={accept}
                        onChange={handleFileSelect}
                        className='hidden'
                        disabled={uploading}
                    />
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleClick}
                        disabled={uploading}
                        className='w-fit'>
                        {uploading ? (
                            <>
                                <span className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <IconUpload className='mr-2 h-4 w-4' />
                                {preview ? 'Change Image' : 'Upload Image'}
                            </>
                        )}
                    </Button>
                    <p className='text-xs text-muted-foreground'>
                        Max size: {maxSize}MB. Formats: JPG, PNG, GIF, WebP
                    </p>
                </div>
            </div>
        </div>
    );
}

