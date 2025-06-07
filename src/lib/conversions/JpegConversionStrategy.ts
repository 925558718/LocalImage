import { ConversionStrategy } from "./ConversionStrategy";

/**
 * JPEG转换策略
 * 处理JPG/JPEG格式的图像转换与压缩
 */
export class JpegConversionStrategy implements ConversionStrategy {
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
		args.push('-q:v', String(Math.round((100 - quality) / 2.5))); 
		
		args.push(outputName);
		return args;
	}
} 