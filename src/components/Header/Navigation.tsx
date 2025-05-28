"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon } from "lucide-react";

interface NavigationItem {
	href: string;
	labelKey: string;
	description?: string;
	icon?: React.ReactNode;
}

function Navigation() {
	const { t } = useI18n();
	const pathname = usePathname();
	const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// 点击外部区域关闭下拉菜单
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDevToolsOpen(false);
			}
		}

		if (isDevToolsOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isDevToolsOpen]);

	// 图片工具组
	const imageTools: NavigationItem[] = [
		{
			href: "/",
			labelKey: "nav_compress",
			description: "compress_desc",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			),
		},
		{
			href: "/animation",
			labelKey: "nav_animation",
			description: "animation_desc",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5V4m0 0v16l-4-3-4 3V4m0 0H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
					<circle cx="9" cy="9" r="1" />
					<circle cx="15" cy="9" r="1" />
					<circle cx="12" cy="15" r="1" />
				</svg>
			),
		},
		{
			href: "/base64",
			labelKey: "nav_base64",
			description: "base64_desc",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
				</svg>
			),
		},
	];

	// 前端开发工具组
	const devTools: NavigationItem[] = [
		{
			href: "/dev/json-formatter",
			labelKey: "nav_json_formatter",
			description: "json_formatter_desc",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			),
		},
		// {
		// 	href: "/dev/url-encoder",
		// 	labelKey: "nav_url_encoder",
		// 	description: "url_encoder_desc",
		// 	icon: (
		// 		<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		// 			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
		// 		</svg>
		// 	),
		// },
		// {
		// 	href: "/dev/color-picker",
		// 	labelKey: "nav_color_picker",
		// 	description: "color_picker_desc",
		// 	icon: (
		// 		<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		// 			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3v18M15 8l4-4 4 4-4 4-4-4z" />
		// 		</svg>
		// 	),
		// },
		// {
		// 	href: "/dev/regex-tester",
		// 	labelKey: "nav_regex_tester",
		// 	description: "regex_tester_desc",
		// 	icon: (
		// 		<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		// 			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
		// 		</svg>
		// 	),
		// },
	];

	// 检查当前路径是否在开发工具组内
	const isDevToolActive = devTools.some(item => item.href === pathname);

	// Web3工具组 - 暂时注释掉
	/*
	const web3Tools: NavigationItem[] = [
		{
			href: "/web3/wallet",
			labelKey: "nav_wallet_tools",
			description: "wallet_tools_desc",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
				</svg>
			),
		},
		{
			href: "/web3/token",
			labelKey: "nav_token_tools",
			description: "token_tools_desc",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
		},
		{
			href: "/web3/nft",
			labelKey: "nav_nft_tools",
			description: "nft_tools_desc",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
				</svg>
			),
		},
		{
			href: "/web3/defi",
			labelKey: "nav_defi_tools",
			description: "defi_tools_desc",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
				</svg>
			),
		},
	];
	*/

	return (
		<nav className="flex items-center space-x-1">
			{/* 图片工具 - 平铺展示 */}
			{imageTools.map((item) => (
				<Link
					key={item.href}
					href={item.href}
					className={cn(
						"flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
						pathname === item.href 
							? "bg-accent text-accent-foreground shadow-sm" 
							: "text-muted-foreground hover:text-foreground"
					)}
				>
					<span className="transition-transform duration-300 ease-in-out group-hover:scale-110">
						{item.icon}
					</span>
					<span className="transition-all duration-300 ease-in-out">{t(item.labelKey)}</span>
				</Link>
			))}

			{/* 前端开发工具 - 折叠菜单 */}
			<div className="relative" ref={dropdownRef}>
				<button
					onClick={() => setIsDevToolsOpen(!isDevToolsOpen)}
					className={cn(
						"flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
						isDevToolActive || isDevToolsOpen
							? "bg-accent text-accent-foreground shadow-sm" 
							: "text-muted-foreground hover:text-foreground"
					)}
				>
					<svg className="w-4 h-4 transition-transform duration-300 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
					</svg>
					<span className="transition-all duration-300 ease-in-out">{t("nav_dev_tools")}</span>
					<ChevronDownIcon 
						className={cn(
							"w-4 h-4 transition-all duration-300 ease-in-out",
							isDevToolsOpen ? "rotate-180" : "rotate-0"
						)} 
					/>
				</button>

				{/* 下拉菜单 */}
				<div className={cn(
					"absolute top-full left-0 mt-1 w-64 bg-popover border rounded-md shadow-lg z-50 transition-all duration-300 ease-in-out origin-top",
					isDevToolsOpen 
						? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
						: "opacity-0 scale-95 -translate-y-2 pointer-events-none"
				)}>
					<div className="p-2">
						{devTools.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setIsDevToolsOpen(false)}
								className={cn(
									"flex items-start space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out hover:bg-accent hover:text-accent-foreground group",
									pathname === item.href && "bg-accent text-accent-foreground"
								)}
							>
								<span className="transition-transform duration-200 ease-in-out group-hover:scale-110 mt-0.5">
									{item.icon}
								</span>
								<div className="flex-1 min-w-0">
									<div className="text-sm font-medium transition-all duration-200 ease-in-out">
										{t(item.labelKey)}
									</div>
									<div className="text-xs text-muted-foreground mt-1 transition-all duration-200 ease-in-out">
										{t(item.description || "")}
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>

			{/* 未来其他领域的功能可以在这里添加折叠菜单 */}
			{/* 例如：Web3工具、AI工具等 */}
		</nav>
	);
}

export default Navigation;