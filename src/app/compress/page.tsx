"use client";

import { useEffect, useState } from "react";
import ffmpeg from "@/lib/ffmpeg";
import { Skeleton } from "@/components/shadcn";
import Compress from "@/components/compress";
import { useI18n } from "@/hooks/useI18n";

function CompressionPage() {
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
		<div className="min-h-screen w-full relative overflow-hidden">
			{/* 背景渐变装饰 */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20" />
			<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
			<div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />

			<main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
				{/* 标题区域 */}
				<div className="text-center mb-12">
					<h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 animate-gradient-shift">
						{t("nav_compress")}
					</h1>
					<p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
						{t("compress_desc")}
					</p>
					
					{/* 特性标签 */}
					<div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500 dark:text-slate-400">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
							<span>{t("high_quality")}</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
							<span>{t("fast_processing")}</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
							<span>{t("privacy_protection")}</span>
						</div>
					</div>
				</div>

				{/* 内容区域 */}
				<div className="w-full max-w-6xl">
					{isLoading ? (
						<div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-700/20 shadow-xl">
							<div className="text-center mb-6">
								<div className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
									{t("load_ffmpeg")}
								</div>
								<div className="text-sm text-slate-600 dark:text-slate-400">
									{t("initializing_image_engine")}
								</div>
							</div>
							
							{/* 加载骨架 */}
							<div className="space-y-6">
								{/* 操作栏骨架 */}
								<div className="flex gap-3 justify-center flex-wrap">
									<Skeleton className="h-10 w-32 rounded-xl" />
									<Skeleton className="h-10 w-24 rounded-xl" />
									<Skeleton className="h-10 w-28 rounded-xl" />
									<Skeleton className="h-10 w-32 rounded-xl" />
								</div>
								
								{/* 上传区域骨架 */}
								<Skeleton className="h-64 w-full rounded-2xl" />
							</div>
						</div>
					) : (
						<Compress />
					)}
				</div>
			</main>
		</div>
	);
}

export default CompressionPage; 