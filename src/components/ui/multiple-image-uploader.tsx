'use client';

import { useState, useRef, useCallback } from 'react';

import { IconPhoto, IconX, IconPlus, IconCheck } from '@tabler/icons-react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { getCroppedImg } from '@/lib/crop-image';
import { cn, getImageUrl } from '@/lib/utils';

interface CropQueueItem {
    src: string;
    fileName: string;
}

interface MultipleImageUploaderProps {
    value?: string[];
    onChange: (urls: string[]) => void;
    onUpload?: (file: File) => Promise<string>;
    label?: string;
    required?: boolean;
    accept?: string;
    maxSize?: number;
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

    // Crop queue state
    const [cropQueue, setCropQueue] = useState<CropQueueItem[]>([]);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (value.length >= maxImages) {
            toast.error(`You can only upload up to ${maxImages} images`);
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            toast.error(`Image exceeds ${maxSize}MB limit`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCropQueue([{ src: reader.result as string, fileName: file.name }]);
        };
        reader.readAsDataURL(file);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCropConfirm = async () => {
        if (!cropQueue[0] || !croppedAreaPixels) return;

        const current = cropQueue[0];
        setUploading(true);

        try {
            const croppedFile = await getCroppedImg(current.src, croppedAreaPixels, 480, 270, 0.6);

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
                    throw new Error(`Upload failed for ${current.fileName}`);
                }
            }

            onChange([...value, tempUrl]);
            setCropQueue([]);
            toast.success('Image uploaded successfully');
        } catch (error: any) {
            console.error('Upload Error:', error);
            toast.error(error.message || `Failed to upload ${current.fileName}`);
            setCropQueue([]);
        } finally {
            setUploading(false);
        }
    };

    const handleCropSkip = () => {
        setCropQueue([]);
    };

    const handleRemove = (index: number) => {
        const newUrls = [...value];
        newUrls.splice(index, 1);
        onChange(newUrls);
    };

    const currentCrop = cropQueue[0] ?? null;

    return (
        <>
            {/* Crop Modal */}
            {currentCrop && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
                    <div className='flex w-[90vw] max-w-lg flex-col gap-4 rounded-xl bg-background p-6 shadow-xl'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h2 className='text-base font-semibold'>Crop Image</h2>
                                <p className='text-xs text-muted-foreground truncate max-w-60'>
                                    {currentCrop.fileName}
                                </p>
                            </div>
                        </div>

                        <div className='relative h-72 w-full overflow-hidden rounded-lg bg-black'>
                            <Cropper
                                image={currentCrop.src}
                                crop={crop}
                                zoom={zoom}
                                aspect={16 / 9}
                                cropShape='rect'
                                showGrid={true}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                style={{
                                    cropAreaStyle: {
                                        border: '2px solid white',
                                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
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

                        <div className='flex justify-between gap-2'>
                            <Button
                                type='button'
                                variant='ghost'
                                onClick={handleCropSkip}
                                disabled={uploading}
                                className='text-muted-foreground'>
                                Skip
                            </Button>
                            <Button type='button' onClick={handleCropConfirm} disabled={uploading}>
                                {uploading ? (
                                    <>
                                        <span className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <IconCheck className='mr-1.5 h-4 w-4' />
                                        Crop & Upload
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Uploader UI */}
            <div className={cn('space-y-3', className)}>
                {label && (
                    <Label>
                        {label} {required && <span className='text-red-500'>*</span>}
                        <span className='ml-2 text-xs font-normal text-muted-foreground'>
                            ({value.length}/{maxImages})
                        </span>
                    </Label>
                )}

                <div className='flex flex-wrap gap-4'>
                    {value.length < maxImages && (
                        <button
                            type='button'
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className={cn(
                                'flex w-40 aspect-video flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-all hover:border-primary/50 hover:bg-muted/50 active:scale-95',
                                uploading && 'cursor-not-allowed opacity-50'
                            )}>
                            {uploading ? (
                                <span className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                            ) : (
                                <>
                                    <IconPlus className='h-8 w-8 text-muted-foreground' />
                                    <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-tight'>
                                        Add Image
                                    </span>
                                </>
                            )}
                        </button>
                    )}

                    {value.map((url, index) => (
                        <div key={`${url}-${index}`} className='group relative'>
                            <div className='w-40 aspect-video overflow-hidden rounded-lg border bg-muted shadow-sm transition-transform hover:scale-[1.02]'>
                                <img
                                    src={getImageUrl(url)}
                                    alt={`Preview ${index + 1}`}
                                    className='h-full w-full object-cover'
                                />
                            </div>
                            <Button
                                type='button'
                                variant='destructive'
                                size='icon'
                                className='absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100'
                                onClick={() => handleRemove(index)}>
                                <IconX className='h-3 w-3' />
                            </Button>
                            <div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 opacity-0 transition-opacity group-hover:opacity-100'>
                                <IconPhoto className='h-6 w-6 text-white/70' />
                            </div>
                        </div>
                    ))}

                    <input
                        ref={fileInputRef}
                        type='file'
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
        </>
    );
}
