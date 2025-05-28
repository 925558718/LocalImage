"use client";

import { useEffect, useState } from "react";
import ffmpeg from "@/lib/ffmpeg";
import { Skeleton } from "@/components/shadcn";
import AnimationComposer from "@/components/animation";
import { useI18n } from "@/hooks/useI18n";

function AnimationPage() {
	const { t } = useI18n();
	const [isLoading, setIsLoading] = useState(true);
	
	useEffect(() => {
		ffmpeg.load().then(() => {
			setIsLoading(false);
		});
	}, []);
	
	return (
		<main className="w-full h-full flex flex-col items-center min-h-[calc(100vh-4rem)] pb-[56px] pt-8">
			<div className="min-h-[30vh] flex items-center justify-center flex-col">
				<div className="text-[40px] uppercase">{t("animation_composer")}</div>
				<div className="font-OS text-[12px] opacity-60 text-center">{t("animation_desc")}</div>
			</div>
			{isLoading ? (
				<div className="flex flex-col items-center justify-center min-w-[700px] space-y-4">
					<div className="text-center mb-4">
						<div className="text-lg font-medium mb-2">{t("load_ffmpeg")}</div>
						<div className="text-sm text-muted-foreground">正在初始化动画处理引擎...</div>
					</div>
					
					<div className="w-full min-w-[700px] space-y-4">
						<div className="flex gap-2 justify-center w-full">
							<Skeleton className="h-9 w-[180px]" />
							<Skeleton className="h-9 w-20" />
							<Skeleton className="h-9 w-24" />
							<Skeleton className="h-9 w-28" />
						</div>
						
						<div className="space-y-4 min-w-[300px]">
							<Skeleton className="h-[250px] w-full rounded-lg" />
						</div>
					</div>
				</div>
			) : (
				<AnimationComposer />
			)}
		</main>
	);
}

export default AnimationPage;