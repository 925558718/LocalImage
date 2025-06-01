"use client";

import { useEffect, useState } from "react";
import ffmpeg from "@/lib/ffmpeg";
import { Skeleton } from "@/components/shadcn";
import AnimationComposer from "@/components/animation";
import { useI18n } from "@/hooks/useI18n";

function Page() {
	const { t } = useI18n();
	const [isLoading, setIsLoading] = useState(true);
	
	useEffect(() => {
		if (ffmpeg) {
			ffmpeg.load().then(() => {
				setIsLoading(false);
			}).catch((error) => {
				console.error('FFmpeg加载失败:', error);
				setIsLoading(false); // 即使失败也停止loading状态
			});
		} else {
			// 如果ffmpeg实例不存在（比如在服务端），直接停止loading
			setIsLoading(false);
		}
	}, []);
	
	return (
		<main className="w-full h-full flex flex-col items-center min-h-[calc(100vh-4rem)] pb-[56px] pt-8">
			<div className="min-h-[30vh] flex items-center justify-center flex-col">
				<h1 className="text-[40px] uppercase">{t("animation_composer")}</h1>
				<p className="font-OS text-[12px] opacity-60 text-center">{t("animation_desc")}</p>
			</div>
			{isLoading ? (
				<div className="flex flex-col items-center justify-center min-w-[700px] space-y-4">
					<div className="text-center mb-4">
						<div className="text-lg font-medium mb-2">正在初始化动画合成引擎...</div>
						<div className="text-sm text-muted-foreground">请稍候，正在加载WebP/GIF处理功能</div>
					</div>
					
					{/* 动画合成器加载骨架 */}
					<div className="w-full min-w-[700px] space-y-4">
						{/* 操作栏骨架 - 匹配动画合成器的操作栏布局 */}
						<div className="flex gap-2 justify-center w-full">
							<Skeleton className="h-9 w-[120px]" /> {/* Format Select */}
							<Skeleton className="h-9 w-20" />      {/* Preview */}
							<Skeleton className="h-9 w-28" />      {/* Create Animation */}
						</div>
						
						{/* 设置区域骨架 */}
						<div className="flex gap-4 justify-center items-center">
							<Skeleton className="h-6 w-24" />      {/* Frame Rate Label */}
							<Skeleton className="h-6 w-32" />      {/* Frame Rate Slider */}
							<Skeleton className="h-6 w-16" />      {/* Frame Rate Value */}
							<Skeleton className="h-6 w-20" />      {/* Quality Label */}
							<Skeleton className="h-6 w-32" />      {/* Quality Slider */}
							<Skeleton className="h-6 w-16" />      {/* Quality Value */}
						</div>
						
						{/* 文件上传区域骨架 */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div className="space-y-4">
								<Skeleton className="h-[300px] w-full rounded-lg" />
							</div>
							<div className="space-y-4">
								<Skeleton className="h-[300px] w-full rounded-lg" />
							</div>
						</div>
					</div>
				</div>
			) : (
				<AnimationComposer />
			)}
		</main>
	);
}

export default Page;
