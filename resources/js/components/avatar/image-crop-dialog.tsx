import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

interface ImageCropDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    image: string;
    crop: Point;
    zoom: number;
    aspect: number;
    onCropChange: (crop: Point) => void;
    onZoomChange: (zoom: number) => void;
    onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
    onConfirm: () => void;
    isProcessing?: boolean;
}

export function ImageCropDialog({
    open,
    onOpenChange,
    image,
    crop,
    zoom,
    aspect,
    onCropChange,
    onZoomChange,
    onCropComplete,
    onConfirm,
    isProcessing = false,
}: ImageCropDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Crop Profile Picture
                    </DialogTitle>
                </DialogHeader>

                <div className="relative mt-4 h-[400px] w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropComplete}
                        showGrid={false}
                        cropShape="round"
                        objectFit="horizontal-cover"
                    />
                </div>

                <div className="mt-6 space-y-4">
                    {/* Zoom Control */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-muted-foreground">
                                Zoom
                            </label>
                            <span className="text-sm text-muted-foreground">
                                {Math.round(zoom * 100)}%
                            </span>
                        </div>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value: number[]) => onZoomChange(value[0])}
                            className="w-full"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isProcessing ? (
                                <>
                                    <svg
                                        className="mr-2 h-4 w-4 animate-spin"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                'Confirm & Upload'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
