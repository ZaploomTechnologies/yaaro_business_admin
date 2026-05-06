'use client';

import { useState, useCallback } from 'react';

import { IconCheck, IconX } from '@tabler/icons-react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

import { Button } from '@/components/ui/button';

export interface AspectRatioOption {
    label: string;
    value: number;
}

interface ImageCropModalProps {
    src: string;
    fileName?: string;
    aspectRatios: AspectRatioOption[];
    defaultAspect: number;
    onConfirm: (croppedAreaPixels: Area, aspectRatio: number) => void;
    onCancel: () => void;
}

export function ImageCropModal({
    src,
    fileName,
    aspectRatios,
    defaultAspect,
    onConfirm,
    onCancel,
}: ImageCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspectRatio, setAspectRatio] = useState(defaultAspect);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleAspectChange = (value: number) => {
        setAspectRatio(value);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    const handleConfirm = () => {
        if (!croppedAreaPixels) return;
        onConfirm(croppedAreaPixels, aspectRatio);
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
            <div className='flex w-[90vw] max-w-lg flex-col gap-4 rounded-xl bg-background p-6 shadow-xl'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-base font-semibold'>Crop Image</h2>
                        {fileName && (
                            <p className='text-xs text-muted-foreground truncate max-w-60'>{fileName}</p>
                        )}
                    </div>
                    {aspectRatios.length > 1 && (
                        <div className='flex gap-1 rounded-lg border p-1'>
                            {aspectRatios.map(({ label, value }) => (
                                <button
                                    key={label}
                                    type='button'
                                    onClick={() => handleAspectChange(value)}
                                    className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                                        aspectRatio === value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className='relative h-72 w-full overflow-hidden rounded-lg bg-black'>
                    <Cropper
                        image={src}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
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
                    <Button type='button' variant='outline' onClick={onCancel}>
                        <IconX className='mr-1.5 h-4 w-4' />
                        Cancel
                    </Button>
                    <Button type='button' onClick={handleConfirm} disabled={!croppedAreaPixels}>
                        <IconCheck className='mr-1.5 h-4 w-4' />
                        Crop & Upload
                    </Button>
                </div>
            </div>
        </div>
    );
}
