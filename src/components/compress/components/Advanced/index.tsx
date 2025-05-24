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
				<Button variant="outline">{t("advance")}</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">{t("advance")}</h4>
					</div>
					<div className="grid gap-2">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="width">{t("advanceoption.width")}</Label>
							<Input
								id="width"
								value={width}
								onChange={e => handleChange({ width: e.target.value })}
								className="col-span-3 h-8"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="height">{t("advanceoption.height")}</Label>
							<Input
								id="height"
								value={height}
								onChange={e => handleChange({ height: e.target.value })}
								className="col-span-3 h-8"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="quality">{t("advanceoption.quality")}</Label>
							<Slider
								value={[quality]}
								onValueChange={v => handleChange({ quality: v[0] })}
								max={100}
								step={1}
								className="col-span-3 h-8"
							/>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default Advanced;
