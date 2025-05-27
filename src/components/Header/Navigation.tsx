"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

interface NavigationItem {
	href: string;
	labelKey: string;
	icon?: React.ReactNode;
}

function Navigation() {
	const { t } = useI18n();
	const pathname = usePathname();

	const navigationItems: NavigationItem[] = [
		{
			href: "/",
			labelKey: "nav_compress",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			),
		},
		{
			href: "/base64",
			labelKey: "nav_base64",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
				</svg>
			),
		},
	];

	return (
		<nav className="flex items-center space-x-1">
			{navigationItems.map((item) => {
				const isActive = pathname === item.href;
				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ease-out group",
							isActive
								? "text-primary"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						{/* 图标 */}
						<div className={cn(
							"transition-all duration-300 ease-out",
							isActive 
								? "scale-110" 
								: "group-hover:scale-105"
						)}>
							{item.icon}
						</div>
						
						{/* 文字 */}
						<span className={cn(
							"transition-all duration-300 ease-out",
							isActive 
								? "font-semibold" 
								: "group-hover:translate-x-0.5"
						)}>
							{t(item.labelKey)}
						</span>
						
						{/* 底部下划线 - 只在活跃状态显示 */}
						<div className={cn(
							"absolute bottom-0 left-1/2 h-0.5 bg-primary rounded-full transition-all duration-500 ease-out",
							isActive 
								? "w-3/4 -translate-x-1/2 opacity-100" 
								: "w-0 -translate-x-1/2 opacity-0"
						)}></div>
					</Link>
				);
			})}
		</nav>
	);
}

export default Navigation; 