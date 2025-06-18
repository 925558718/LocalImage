"use client";

import AnimationComposer from "@/components/animation";
import styles from '@/components/animation/animation.module.scss';

function Page() {
	return (
		<>
			<main className="w-full min-h-screen flex items-center justify-center p-4">
				{/* 内容区域 */}
				<div className="w-full max-w-7xl mx-auto">
					<AnimationComposer />
				</div>
			</main>
		</>
	);
}

export default Page;
