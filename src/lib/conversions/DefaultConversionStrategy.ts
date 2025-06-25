import { ConversionStrategy } from "./ConversionStrategy";

/**
 * 默认转换策略 - 主要用于PNG格式的转换
 * 不应用特殊的压缩参数，仅处理缩放
 */
export class DefaultConversionStrategy implements ConversionStrategy {
	getArgs(
		inputFileName: string,
		outputName: string,
		quality: number,
		width?: number,
		height?: number,
	): string[] {
		const args = ["-i", inputFileName];

		// 分辨率缩放
		if (width || height) {
			let scaleArg = "scale=";
			scaleArg += width ? `${width}:` : "-1:";
			scaleArg += height ? `${height}` : "-1";
			args.push("-vf", scaleArg);
		}

		// 获取输出格式
		// const format = outputName
		// 	.split(".")
		// 	.pop()
		// 	?.toLowerCase() as ImageFormatType;

		const qualityParam = getQuality(quality);
		const [paramName, paramValue] = qualityParam.split(" ");
		args.push(paramName, paramValue);

		args.push(outputName);
		return args;
	}
}

/**
 * 获取质量参数
 * @param quality 质量值(0-100)
 * @param format 图像格式
 * @returns 格式化的质量参数字符串 "参数名 参数值"
 */
export const getQuality = (quality: number): string => {
	return `-q:v ${Math.round((100 - quality) * 0.19 + 12)}`;
};
