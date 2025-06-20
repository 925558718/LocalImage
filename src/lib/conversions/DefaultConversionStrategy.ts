import { ConversionStrategy } from "./ConversionStrategy";

/**
 * 默认转换策略 - 主要用于PNG格式的转换
 * 不应用特殊的压缩参数，仅处理缩放
 */
export class DefaultConversionStrategy implements ConversionStrategy {
	getArgs(inputFileName: string, outputName: string, quality: number, width?: number, height?: number): string[] {
		const args = ['-i', inputFileName];
		
		// 分辨率缩放
		if (width || height) {
			let scaleArg = 'scale=';
			scaleArg += width ? `${width}:` : '-1:';
			scaleArg += height ? `${height}` : '-1';
			args.push('-vf', scaleArg);
		}
		
		// JPEG质量控制
		// FFMPEG的q:v参数范围是0-31，其中0是最高质量，31是最低质量
		// 我们将0-100的quality参数映射到31-0
		args.push('-q:v', String(Math.round((100 - quality) * 0.19 + 12))); 
		
		args.push(outputName);
		return args;
	}
} 