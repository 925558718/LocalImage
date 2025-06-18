"use client";

import AnimationComposer from "@/components/animation";
import styles from '@/components/animation/animation.module.scss';

function Page() {
	return (
		<>
			
			<main className="w-full min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
				{/* 背景渐变层 */}
				<div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900" />
				
				{/* 装饰性背景元素 */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
					<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl" />
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl" />
				</div>
				
				{/* 内容区域 */}
				<div className="relative z-10 w-full">
					<div className="w-full max-w-7xl mx-auto">
						<AnimationComposer />
					</div>
				</div>
			</main>
		</>
	);
}

export default Page;
