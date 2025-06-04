"use client";

import Compress from "@/components/compress";
import { useI18n } from "@/hooks/useI18n";

function CompressionPage() {
	const { t } = useI18n();
	
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
					<Compress />
				</div>
			</main>
		</div>
	);
}

export default CompressionPage; 