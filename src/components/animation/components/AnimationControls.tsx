import { useTranslations } from "next-intl";
import { Slider, Label } from "@/components/shadcn";

interface AnimationControlsProps {
  frameRate: number[];
  quality: number[];
  onFrameRateChange: (value: number[]) => void;
  onQualityChange: (value: number[]) => void;
}

export default function AnimationControls({
  frameRate,
  quality,
  onFrameRateChange,
  onQualityChange
}: AnimationControlsProps) {
  const t = useTranslations();
  
  return (
    <>
      {/* Frame Rate */}
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("frame_rate")}
        </Label>
        <div className="flex items-center gap-2">
          <div className="w-24">
            <Slider
              value={frameRate}
              onValueChange={onFrameRateChange}
              min={1}
              max={60}
              step={1}
              className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-500"
            />
          </div>
          <span className="text-sm font-mono w-12 text-slate-600 dark:text-slate-400">
            {frameRate[0]}fps
          </span>
        </div>
      </div>

      {/* Quality */}
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("quality")}
        </Label>
        <div className="flex items-center gap-2">
          <div className="w-24">
            <Slider
              value={quality}
              onValueChange={onQualityChange}
              min={10}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-green-500 [&_[role=slider]]:border-green-500"
            />
          </div>
          <span className="text-sm font-mono w-12 text-slate-600 dark:text-slate-400">
            {quality[0]}%
          </span>
        </div>
      </div>
    </>
  );
} 