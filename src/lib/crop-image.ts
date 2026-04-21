export type { Area as PixelCrop } from 'react-easy-crop';

import type { Area } from 'react-easy-crop';

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', reject);
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    outputWidth = 96,
    outputHeight = outputWidth,
    quality = 0.95
): Promise<File> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputWidth,
        outputHeight
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(new File([blob], 'cropped.jpg', { type: 'image/jpeg' }));
            },
            'image/jpeg',
            quality
        );
    });
}
