"use client";

import { useEffect, useState } from "react";
import ffmpeg from "@/lib/ffmpeg";
import { Skeleton } from "@/components/shadcn";
import Compress from "@/components/compress";
import { useI18n } from "@/hooks/useI18n";
import EzoicAd from "@/components/AdSense";

function Page() {
	const { t } = useI18n();
	const [isLoading, setIsloading] = useState(true);
	useEffect(() => {
		ffmpeg.load().then((res) => {
			setIsloading(false);
		});
	}, []);
	return (
		<main className="w-full h-full flex flex-col items-center min-h-[calc(100vh-4rem)] pb-[56px] pt-8">
			<div className="min-h-[30vh] flex items-center justify-center flex-col">
				<div className="text-[40px] uppercase">{t("name")}</div>
				<div className="font-OS text-[12px] opacity-60 text-center">{t("desc")}</div>
			</div>
			{isLoading ? (
				<div className="flex flex-col items-center justify-center min-w-[700px] space-y-4">
					<div className="text-center mb-4">
						<div className="text-lg font-medium mb-2">{t("load_ffmpeg")}</div>
						<div className="text-sm text-muted-foreground">正在初始化图像处理引擎...</div>
					</div>
					
					{/* 主要内容区域骨架 - 匹配实际组件布局 */}
					<div className="w-full min-w-[700px] space-y-4">
						{/* 操作栏骨架 - 匹配实际的操作栏布局 */}
						<div className="flex gap-2 justify-center w-full">
							<Skeleton className="h-9 w-[180px]" /> {/* Select */}
							<Skeleton className="h-9 w-20" />      {/* Advanced */}
							<Skeleton className="h-9 w-24" />      {/* Compress */}
							<Skeleton className="h-9 w-28" />      {/* Download All */}
						</div>
						
						{/* 文件上传区域骨架 - 匹配DropzoneWithPreview的尺寸 */}
						<div className="space-y-4 min-w-[300px]">
							<Skeleton className="h-[250px] w-full rounded-lg" />
						</div>
					</div>
				</div>
			) : (
				<>
					<Compress />
				</>
			)}
		</main>
	);
}

export default Page;
