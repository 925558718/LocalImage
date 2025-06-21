/**
 * 图像转换策略接口
 * 定义了所有图像转换策略必须实现的方法
 */
export interface ConversionStrategy {
	/**
	 * 获取FFmpeg转换参数
	 * @param inputFileName 输入文件名
	 * @param outputName 输出文件名
	 * @param quality 质量（0-100）
	 * @param width 可选的输出宽度
	 * @param height 可选的输出高度
	 * @returns FFmpeg命令行参数数组
	 */
	getArgs(inputFileName: string, outputName: string, quality: number, width?: number, height?: number): string[];
}

// 支持的图片格式枚举
export enum ImageFormat {
	// 常见格式
	PNG = 'png',
	JPG = 'jpg',
	JPEG = 'jpeg',
	WEBP = 'webp',
	GIF = 'gif',
	BMP = 'bmp',
	TIFF = 'tiff',
	TIF = 'tif',
	ICO = 'ico',
	
	// 专业格式
	DPX = 'dpx',
	EXR = 'exr',
	PPM = 'ppm',
	PGM = 'pgm',
	PBM = 'pbm',
	PAM = 'pam',
	SGI = 'sgi',
	XBM = 'xbm',
}

// 从枚举创建类型
export type ImageFormatType = `${ImageFormat}`;

// 不可转换的格式映射表（只记录不支持转换的映射）
// 格式：{ 源格式: [不可转换的目标格式数组] }
// 只记录有特殊限制的格式，没有记录的格式默认支持所有转换
export const FORMAT_CONVERSION_MAP: Partial<Record<ImageFormatType, ImageFormatType[]>> = {
	// WebP格式不能转换到任何其他格式（包括自身）
	[ImageFormat.WEBP]: Object.values(ImageFormat) as ImageFormatType[],
	// 示例：某些格式可能不支持转换为特定格式
	// [ImageFormat.GIF]: [ImageFormat.AVIF], // GIF不支持转换为AVIF
	// [ImageFormat.ICO]: [ImageFormat.TIFF, ImageFormat.EXR], // ICO不支持转换为TIFF和EXR
	// [ImageFormat.BMP]: [ImageFormat.WEBP], // BMP不支持转换为WebP
}; 