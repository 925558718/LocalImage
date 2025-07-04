import {
	ChevronRight,
	RotateCcw,
	RulerDimensionLine,
	Settings2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
	Button,
	Input,
	Label,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn";

interface AdvancedProps {
	onChange?: (v: {
		width: string;
		height: string;
		outputSuffixName: string;
	}) => void;
}

function Advanced({ onChange }: AdvancedProps) {
	const t = useTranslations();
	const [width, setWidth] = useState("");
	const [height, setHeight] = useState("");
	const [outputSuffixName, setOutputSuffixName] = useState("");

	function handleChange(
		next: Partial<{
			width: string;
			height: string;
			outputSuffixName: string;
		}>,
	) {
		const newVal = {
			width: next.width ?? width,
			height: next.height ?? height,
			outputSuffixName: next.outputSuffixName ?? "",
		};
		setWidth(newVal.width);
		setHeight(newVal.height);
		setOutputSuffixName(newVal.outputSuffixName);
		onChange?.(newVal);
	}

	// 重置所有设置
	function handleReset() {
		const resetVal = {
			width: "",
			height: "",
			outputSuffixName: "",
		};
		setWidth("");
		setHeight("");
		setOutputSuffixName("");
		onChange?.(resetVal);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className="flex items-center gap-3 px-6 py-3 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30 hover:bg-card/60 transition-all duration-200 cursor-pointer">
					<div className="flex items-center gap-2">
						<Settings2 color="#C3B588" size={16} />
						<span className="text-sm font-medium text-foreground text-nowrap">
							{t("advance")}
						</span>
					</div>
					<ChevronRight size={16} className="text-primary" />
				</div>
			</PopoverTrigger>
			<PopoverContent className="w-80 bg-card/95 backdrop-blur-xl border border-border/30 shadow-2xl rounded-2xl">
				<div className="grid gap-6">
					{/* 标题区域 */}
					<div className="flex items-center gap-3 pb-2 border-b border-border/50">
						<div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
							<Settings2 color="#C3B588" size={16} />
						</div>
						<h4 className="font-semibold text-foreground">{t("advance")}</h4>
					</div>

					{/* 设置区域 */}
					<div className="grid gap-5">
						{/* 尺寸设置 */}
						<div className="space-y-4">
							<h5 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<RulerDimensionLine size={16} />
								{t("image_size")}
							</h5>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2">
									<Label
										htmlFor="width"
										className="text-xs font-medium text-muted-foreground"
									>
										{t("advanceoption.width")}
									</Label>
									<Input
										id={useId()}
										value={width}
										onChange={(e) => handleChange({ width: e.target.value })}
										placeholder="auto"
										className="h-9 bg-background/60 backdrop-blur-sm border-border/40 rounded-xl text-sm"
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="height"
										className="text-xs font-medium text-muted-foreground"
									>
										{t("advanceoption.height")}
									</Label>
									<Input
										id={useId()}
										value={height}
										onChange={(e) => handleChange({ height: e.target.value })}
										placeholder="auto"
										className="h-9 bg-background/60 backdrop-blur-sm border-border/40 rounded-xl text-sm"
									/>
								</div>
							</div>
						</div>

						{/* 输出文件名后缀设置 */}
						<div className="space-y-4">
							<h5 className="text-sm font-medium text-muted-foreground">
								{t("advanceoption.outputName")}
							</h5>
							<div className="space-y-2">
								<Input
									id={useId()}
									value={outputSuffixName}
									onChange={(e) =>
										handleChange({ outputSuffixName: e.target.value })
									}
									placeholder={t("advanceoption.outputName_placeholder")}
									className="h-9 bg-background/60 backdrop-blur-sm border-border/40 rounded-xl text-sm"
								/>
								<p className="text-xs text-muted-foreground">
									{t("advanceoption.outputName_help")}
								</p>
							</div>
						</div>

						{/* 重置按钮 */}
						<div className="pt-2 border-t border-border/30">
							<Button
								onClick={handleReset}
								variant="outline"
								size="sm"
								className="w-full h-9 bg-background/60 backdrop-blur-sm border-border/40 text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all duration-200"
							>
								<RotateCcw size={14} className="mr-2" />
								{t("reset_settings")}
							</Button>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default Advanced;
