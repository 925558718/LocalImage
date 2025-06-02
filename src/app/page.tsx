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
		<>
			<style jsx>{`
				@keyframes gradient-shift {
					0% {
						background-position: 0% 50%;
					}
					50% {
						background-position: 100% 50%;
					}
					100% {
						background-position: 0% 50%;
					}
				}
				
				@keyframes float {
					0%, 100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-10px);
					}
				}
				
				@keyframes pulse-glow {
					0%, 100% {
						box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
					}
					50% {
						box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
					}
				}
				
				.animation-title {
					font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
					font-weight: 900;
					font-size: 3.5rem;
					letter-spacing: -0.025em;
					background: linear-gradient(
						-45deg,
						#3b82f6,
						#8b5cf6,
						#06b6d4,
						#10b981,
						#f59e0b,
						#ef4444,
						#ec4899
					);
					background-size: 400% 400%;
					background-clip: text;
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					animation: gradient-shift 4s ease infinite;
					text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
					filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.4));
				}
				
				.hero-section {
					background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
					border-radius: 20px;
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255, 255, 255, 0.1);
				}
				
				.loading-card {
					background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
					backdrop-filter: blur(20px);
					border: 1px solid rgba(59, 130, 246, 0.2);
					animation: pulse-glow 3s ease-in-out infinite;
				}
				
				.dark .loading-card {
					background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
				}
				
				.float-animation {
					animation: float 6s ease-in-out infinite;
				}
				
				@media (max-width: 768px) {
					.animation-title {
						font-size: 2.5rem;
					}
				}
			`}</style>
			
			<main className="w-full h-full flex flex-col items-center min-h-[calc(100vh-4rem)] pb-[56px] pt-8">
				{/* Hero Section */}
				<div className="min-h-[25vh] flex items-center justify-center flex-col p-6 mb-6 max-w-4xl mx-auto">
					<h1 className="animation-title mb-3 text-center">
						{t("animation_composer")}
					</h1>
					<p className="font-OS text-base opacity-80 text-center max-w-2xl leading-relaxed mb-4">
						{t("animation_desc")}
					</p>
					
					{/* Feature highlights */}
					<div className="flex flex-wrap justify-center gap-3">
						<div className="flex items-center gap-2 bg-white/20 dark:bg-black/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
							<span>WebP & GIF</span>
						</div>
						<div className="flex items-center gap-2 bg-white/20 dark:bg-black/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
							<div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
							<span>{t("local_processing")}</span>
						</div>
						<div className="flex items-center gap-2 bg-white/20 dark:bg-black/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
							<div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
							<span>{t("real_time_preview")}</span>
						</div>
					</div>
				</div>
				
				{isLoading ? (
					<div className="flex flex-col items-center justify-center min-w-[700px] space-y-6">
						<div className="text-center">
							{/* Simple Loading Spinner */}
							<div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
							
							{/* Loading Text */}
							<div className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
								{t("initializing_animation_engine")}
							</div>
							<div className="text-sm text-gray-500 dark:text-gray-400">
								{t("loading_webp_gif_processing")}
							</div>
						</div>
					</div>
				) : (
					<div className="w-full max-w-7xl mx-auto px-4">
						<AnimationComposer />
					</div>
				)}
			</main>
		</>
	);
}

export default Page;
