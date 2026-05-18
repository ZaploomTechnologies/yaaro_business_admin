'use client';

import { useState, useRef, useEffect } from 'react';

import { IconPhoto, IconX, IconUpload } from '@tabler/icons-react';
import type { Area } from 'react-easy-crop';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ImageCropModal } from '@/components/ui/image-crop-modal';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { getCroppedImg } from '@/lib/crop-image';
import { cn, getImageUrl } from '@/lib/utils';

const ASPECT_RATIOS = [
    { label: '1:1', value: 1 },
    { label: '16:9', value: 16 / 9 },
];

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    onUpload?: (file: File) => Promise<string>;
    label?: string;
    required?: boolean;
    accept?: string;
    maxSize?: number;
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
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreview(value || null);
    }, [value]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        if (file.size / (1024 * 1024) > maxSize) {
            toast.error(`Image size must be less than ${maxSize}MB`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setCropSrc(reader.result as string);
        reader.readAsDataURL(file);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCropConfirm = async (croppedAreaPixels: Area, aspectRatio: number) => {
        if (!cropSrc) return;

        setCropSrc(null);
        setUploading(true);

        try {
            const outputWidth = 124;
            const outputHeight = Math.round(outputWidth / aspectRatio);
            const croppedFile = await getCroppedImg(cropSrc, croppedAreaPixels, outputWidth, outputHeight, 0.82);

            const localPreview = URL.createObjectURL(croppedFile);
            setPreview(localPreview);

            let tempUrl = '';
            if (onUpload) {
                tempUrl = await onUpload(croppedFile);
            } else {
                const formData = new FormData();
                formData.append('image', croppedFile);
                const response = await apiClient.post<any>('/business/uploadImage', formData);
                if (response.success && response.data?.url) {
                    tempUrl = response.data.url;
                } else {
                    throw new Error('Upload failed: Invalid response from server');
                }
            }

            onChange(tempUrl);
            setPreview(tempUrl);
            toast.success('Image uploaded successfully');
        } catch (error: any) {
            console.error('Upload Error:', error);
            toast.error(error.message || 'Failed to upload image');
            setPreview(value || null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <>
            {cropSrc && (
                <ImageCropModal
                    src={cropSrc}
                    aspectRatios={ASPECT_RATIOS}
                    defaultAspect={1}
                    onConfirm={handleCropConfirm}
                    onCancel={() => setCropSrc(null)}
                />
            )}

            <div className={cn('space-y-2', className)}>
                {label && (
                    <Label htmlFor='image-upload'>
                        {label} {required && <span className='text-red-500'>*</span>}
                    </Label>
                )}

                <div className='flex items-center gap-4'>
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
                            onClick={() => fileInputRef.current?.click()}
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
        </>
    );
}
