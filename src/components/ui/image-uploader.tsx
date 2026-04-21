'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

import { IconPhoto, IconX, IconUpload, IconCheck } from '@tabler/icons-react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { getCroppedImg } from '@/lib/crop-image';
import { cn, getImageUrl } from '@/lib/utils';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Crop modal state
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    useEffect(() => {
        setPreview(value || null);
    }, [value]);

    const onCropComplete = useCallback((_: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            toast.error(`Image size must be less than ${maxSize}MB`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setCropSrc(reader.result as string);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        };
        reader.readAsDataURL(file);

        // Reset input so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCropConfirm = async () => {
        if (!cropSrc || !croppedAreaPixels) return;

        setUploading(true);
        setCropSrc(null);

        try {
            const croppedFile = await getCroppedImg(cropSrc, croppedAreaPixels, 124, 124, 0.82);

            // Show local preview immediately
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

            if (tempUrl) {
                onChange(tempUrl);
                setPreview(tempUrl);
                toast.success('Image uploaded successfully');
            }
        } catch (error: any) {
            console.error('Upload Error:', error);
            toast.error(error.message || 'Failed to upload image');
            setPreview(value || null);
        } finally {
            setUploading(false);
        }
    };

    const handleCropCancel = () => {
        setCropSrc(null);
    };

    const handleRemove = () => {
        setPreview(null);
        onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <>
            {/* Crop Modal */}
            {cropSrc && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
                    <div className='flex w-[90vw] max-w-md flex-col gap-4 rounded-xl bg-background p-6 shadow-xl'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-base font-semibold'>Crop Image</h2>
                        </div>

                        <div className='relative h-72 w-full overflow-hidden rounded-lg bg-black'>
                            <Cropper
                                image={cropSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape='rect'
                                showGrid={true}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                style={{
                                    cropAreaStyle: {
                                        border: '2px solid white',
                                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                                        color: 'white',
                                    },
                                }}
                            />
                        </div>

                        {/* Zoom slider */}
                        <div className='flex items-center gap-3'>
                            <span className='text-xs text-muted-foreground'>Zoom</span>
                            <input
                                type='range'
                                min={1}
                                max={3}
                                step={0.01}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className='h-1.5 w-full cursor-pointer accent-primary'
                            />
                        </div>

                        <div className='flex justify-end gap-2'>
                            <Button type='button' variant='outline' onClick={handleCropCancel}>
                                <IconX className='mr-1.5 h-4 w-4' />
                                Cancel
                            </Button>
                            <Button type='button' onClick={handleCropConfirm}>
                                <IconCheck className='mr-1.5 h-4 w-4' />
                                Crop & Upload
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Uploader UI */}
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
