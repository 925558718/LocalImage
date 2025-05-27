"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";

function Logo() {
	const { t } = useI18n();

	return (
		<Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-all duration-300 group">
			{/* Logo图标 - 现代化设计 */}
			<div className="relative w-11 h-11 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 animate-glow">
				{/* 背景光晕效果 */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent rounded-2xl blur-sm group-hover:blur-lg transition-all duration-500 animate-pulse"></div>
				
				{/* 装饰性圆环 */}
				<div className="absolute inset-1 border border-primary-foreground/20 rounded-xl group-hover:border-primary-foreground/40 transition-all duration-300"></div>
				
				{/* 主图标 - 抽象的图像处理符号 */}
				<div className="relative z-10 group-hover:scale-110 transition-transform duration-300">
					<svg
						viewBox="0 0 24 24"
						className="w-6 h-6 text-primary-foreground drop-shadow-sm"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
					>
						{/* 创意的图像处理图标 */}
						<circle 
							cx="12" 
							cy="12" 
							r="9" 
							className="group-hover:animate-spin transition-all duration-1000"
							strokeLinecap="round"
						/>
						<path 
							d="M9 12l2 2 4-4" 
							className="animate-pulse group-hover:animate-bounce"
							strokeLinecap="round" 
							strokeLinejoin="round"
						/>
						<path 
							d="M8 8l8 8M16 8l-8 8" 
							strokeLinecap="round" 
							strokeLinejoin="round" 
							className="opacity-40 group-hover:opacity-70 transition-opacity duration-300"
							strokeWidth="1.5"
						/>
					</svg>
				</div>
			</div>
			
			{/* 商标名称 */}
			<div className="flex flex-col">
				{/* Limgx - 主商标名 */}
				<div className="relative overflow-hidden">
					<span 
						className="font-black text-2xl leading-none tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient-x font-inter"
						style={{
							fontWeight: 900,
							letterSpacing: '-0.02em'
						}}
					>
						Limgx
					</span>
					{/* 下划线动画 */}
					<div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/50 w-0 group-hover:w-full transition-all duration-700 ease-out rounded-full"></div>
					{/* 光点效果 */}
					<div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
				</div>
				
				{/* 副标题 */}
				<span className="text-xs text-muted-foreground leading-none font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-1 group-hover:translate-y-0">
					{t("logo_subtitle")}
				</span>
			</div>
		</Link>
	);
}

export default Logo; 