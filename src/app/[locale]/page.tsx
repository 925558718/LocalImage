"use client";

import Compress from "@/components/compress";
import { useTranslations } from 'next-intl';

function Page() {
	const t = useTranslations();
	
	return (
		<main className="flex flex-col items-center justify-center min-h-screen px-4">
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
	);
}

export default Page;
