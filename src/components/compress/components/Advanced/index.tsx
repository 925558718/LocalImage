import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	Button,
	Input,
	Label,
	Slider,
} from "@/components/shadcn";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	Settings2,
	ChevronRight,
	RulerDimensionLine,
	BicepsFlexed,
} from "lucide-react";
interface AdvancedProps {
	onChange?: (v: {
		width: string;
		height: string;
		quality: number;
		outputName: string;
	}) => void;
}

function Advanced({ onChange }: AdvancedProps) {
	const t = useTranslations();
	const [width, setWidth] = useState("");
	const [height, setHeight] = useState("");
	const [quality, setQuality] = useState(85);
	const [outputName, setOutputName] = useState("");
	function handleChange(
		next: Partial<{
			width: string;
			height: string;
			quality: number;
			outputName: string;
		}>,
	) {
		const newVal = {
			width: next.width ?? width,
			height: next.height ?? height,
			quality: next.quality ?? quality,
			outputName: next.outputName ?? "",
		};
		setWidth(newVal.width);
		setHeight(newVal.height);
		setQuality(newVal.quality);
		setOutputName(newVal.outputName);
		onChange?.(newVal);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className="flex items-center gap-3 px-6 py-3 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30 hover:bg-card/60 transition-all duration-200 cursor-pointer">
					<div className="flex items-center gap-2">
						<Settings2 color="#C3B588" size={16} />
						<span className="text-sm font-medium text-foreground">
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
						<h4 className="font-semibold text-foreground">
							{t("advance")}
						</h4>
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
										id="width"
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
										id="height"
										value={height}
										onChange={(e) => handleChange({ height: e.target.value })}
										placeholder="auto"
										className="h-9 bg-background/60 backdrop-blur-sm border-border/40 rounded-xl text-sm"
									/>
								</div>
							</div>
						</div>

						{/* 质量设置 */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h5 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
									<BicepsFlexed size={16} />
									{t("advanceoption.quality")}
								</h5>
								<span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
									{quality}%
								</span>
							</div>
							<div className="px-2">
								<Slider
									value={[quality]}
									onValueChange={(v) => handleChange({ quality: v[0] })}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>
							<div className="flex justify-between text-xs text-muted-foreground px-2">
								<span>{t("low_quality")}</span>
								<span>{t("high_quality")}</span>
							</div>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default Advanced;
