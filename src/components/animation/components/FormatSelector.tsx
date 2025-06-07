import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn";

interface FormatSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FormatSelector({ value, onChange }: FormatSelectorProps) {
  const t = useTranslations();
  
  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("select_format")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="webp">WebP {t("animation")}</SelectItem>
          <SelectItem value="gif">GIF {t("animation")}</SelectItem>
          <SelectItem value="mp4">MP4 {t("video")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 