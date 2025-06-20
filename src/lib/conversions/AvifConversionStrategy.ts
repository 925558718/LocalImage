import { ConversionStrategy } from "./ConversionStrategy";

/**
 * AVIF转换策略
 * 处理AVIF格式的图像转换与压缩
 */
export class AvifConversionStrategy implements ConversionStrategy {
	getArgs(inputFileName: string, outputName: string, quality: number, width?: number, height?: number): string[] {
		const args = ['-i', inputFileName];
		
		// 分辨率缩放
		if (width || height) {
			let scaleArg = 'scale=';
			scaleArg += width ? `${width}:` : '-1:';
			scaleArg += height ? `${height}` : '-1';
			args.push('-vf', scaleArg);
		}
		
		// AVIF质量控制
		// AV1的CRF范围是0-63，其中0是无损，63是最低质量
		// 将0-100的quality映射到63-0
		args.push('-crf', String(Math.round((100 - quality) * 0.63)));
		
		
		args.push(outputName);
		return args;
	}
} 