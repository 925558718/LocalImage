import { Clapperboard, Loader2, Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/shadcn";

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
	onCreateAnimation,
}: ActionButtonsProps) {
	const t = useTranslations();

	return (
		<div className="flex items-center gap-3">
			<Button
				onClick={onPreviewToggle}
				disabled={filesCount < 2}
				variant="outline"
				size="sm"
				className="bg-card border-border"
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
				className="w-40 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg disabled:opacity-50"
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
