import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	Button,
	Input,
	Label,
	Slider,
} from "@/components/shadcn";
import { useI18n } from "@/hooks/useI18n";
import { useState } from "react";

interface AdvancedProps {
	onChange?: (v: { width: string; height: string; quality: number }) => void;
}

function Advanced({ onChange }: AdvancedProps) {
	const { t } = useI18n();
	const [width, setWidth] = useState("");
	const [height, setHeight] = useState("");
	const [quality, setQuality] = useState(85);

	function handleChange(next: Partial<{ width: string; height: string; quality: number }>) {
		const newVal = {
			width: next.width ?? width,
			height: next.height ?? height,
			quality: next.quality ?? quality,
		};
		setWidth(newVal.width);
		setHeight(newVal.height);
		setQuality(newVal.quality);
		onChange?.(newVal);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className="flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-200 cursor-pointer">
					<div className="flex items-center gap-2">
						<svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
						</svg>
						<span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("advance")}</span>
					</div>
					<svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</PopoverTrigger>
			<PopoverContent className="w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-2xl rounded-2xl">
				<div className="grid gap-6">
					{/* 标题区域 */}
					<div className="flex items-center gap-3 pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
						<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
							<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
							</svg>
						</div>
						<h4 className="font-semibold text-slate-800 dark:text-slate-200">{t("advance")}</h4>
					</div>
					
					{/* 设置区域 */}
					<div className="grid gap-5">
						{/* 尺寸设置 */}
						<div className="space-y-4">
							<h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
								</svg>
								图片尺寸
							</h5>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2">
									<Label htmlFor="width" className="text-xs font-medium text-slate-600 dark:text-slate-400">
										{t("advanceoption.width")}
									</Label>
									<Input
										id="width"
										value={width}
										onChange={e => handleChange({ width: e.target.value })}
										placeholder="auto"
										className="h-9 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/40 dark:border-slate-600/40 rounded-xl text-sm"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="height" className="text-xs font-medium text-slate-600 dark:text-slate-400">
										{t("advanceoption.height")}
									</Label>
									<Input
										id="height"
										value={height}
										onChange={e => handleChange({ height: e.target.value })}
										placeholder="auto"
										className="h-9 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/40 dark:border-slate-600/40 rounded-xl text-sm"
									/>
								</div>
							</div>
						</div>
						
						{/* 质量设置 */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
									</svg>
									{t("advanceoption.quality")}
								</h5>
								<span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-lg">
									{quality}%
								</span>
							</div>
							<div className="px-2">
								<Slider
									value={[quality]}
									onValueChange={v => handleChange({ quality: v[0] })}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>
							<div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
								<span>低质量</span>
								<span>高质量</span>
							</div>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default Advanced;
