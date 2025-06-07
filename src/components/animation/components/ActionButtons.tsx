import { useTranslations } from "next-intl";
import { Button } from "@/components/shadcn";
import { Play, Pause, Loader2, Clapperboard } from "lucide-react";

interface ActionButtonsProps {
  isPlaying: boolean;
  loading: boolean;
  ffmpegLoading: boolean;
  ffmpegReady: boolean;
  filesCount: number;
  onPreviewToggle: () => void;
  onCreateAnimation: () => void;
}

export default function ActionButtons({
  isPlaying,
  loading,
  ffmpegLoading,
  ffmpegReady,
  filesCount,
  onPreviewToggle,
  onCreateAnimation
}: ActionButtonsProps) {
  const t = useTranslations();
  
  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={onPreviewToggle}
        disabled={filesCount < 2}
        variant="outline"
        size="sm"
        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 mr-2" />
        ) : (
          <Play className="w-4 h-4 mr-2" />
        )}
        {isPlaying ? t("stop_preview") : t("preview")}
      </Button>

      <Button
        onClick={onCreateAnimation}
        disabled={loading || ffmpegLoading || !ffmpegReady || filesCount < 2}
        size="sm"
        className="w-40 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg disabled:opacity-50"
      >
        {ffmpegLoading || !ffmpegReady || loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Clapperboard className="w-4 h-4 mr-2" />
            {t("create_animation")}
          </>
        )}
      </Button>
    </div>
  );
} 