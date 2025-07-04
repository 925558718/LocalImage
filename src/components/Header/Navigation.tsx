"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface NavigationItem {
	href: string;
	labelKey: string;
	description?: string;
	icon?: React.ReactNode;
}

function Navigation() {
	const t = useTranslations();
	const pathname = usePathname();

	// 图片工具组
	const imageTools: NavigationItem[] = [
		{
			href: "/",
			labelKey: "nav_convert",
			description: "compress_desc",
			icon: (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 15v2a2 2 0 002 2h12a2 2 0 002-2v-2"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 12l4-4m0 0l4 4m-4-4v8"
					/>
				</svg>
			),
		},
		{
			href: "/animation",
			labelKey: "nav_animation",
			description: "animation_desc",
			icon: (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
					/>
					<circle cx="8" cy="12" r="1" fill="currentColor" />
					<circle cx="12" cy="10" r="1" fill="currentColor" />
					<circle cx="12" cy="14" r="1" fill="currentColor" />
				</svg>
			),
		},
		{
			href: "/upscale",
			labelKey: "nav_upscale",
			description: "upscale_desc",
			icon: (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
					/>
				</svg>
			),
		},
		{
			href: "/crop",
			labelKey: "nav_crop",
			description: "crop_desc",
			icon: (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			),
		},
	];

	return (
		<nav className="flex items-center">
			<div className="flex items-center bg-card/20 backdrop-blur-sm rounded-full p-1 border border-border/10">
				{imageTools.map((item) => {
					const isActive = pathname === item.href;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"relative flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out",
								isActive
									? "bg-card text-card-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground hover:bg-card/30",
							)}
						>
							{/* 图标 */}
							<div
								className={cn(
									"transition-colors duration-200",
									isActive ? "text-primary" : "text-muted-foreground",
								)}
							>
								{item.icon}
							</div>

							{/* 文字标签 */}
							<span className="hidden sm:inline-block">{t(item.labelKey)}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}

export default Navigation;
