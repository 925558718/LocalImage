// 支持的图片格式枚举
export enum ImageFormat {
	// 常见格式
	PNG = "png",
	JPG = "jpg",
	JPEG = "jpeg",
	WEBP = "webp",
	GIF = "gif",
	BMP = "bmp",
	TIFF = "tiff",
	TIF = "tif",
	ICO = "ico",

	// 专业格式
	DPX = "dpx",
	EXR = "exr",
	PPM = "ppm",
	PGM = "pgm",
	PBM = "pbm",
	PAM = "pam",
	SGI = "sgi",
	XBM = "xbm",
}

// 从枚举创建类型
export type ImageFormatType = `${ImageFormat}`;

// 不可转换的格式映射表（只记录不支持转换的映射）
// 格式：{ 源格式: [不可转换的目标格式数组] }
// 只记录有特殊限制的格式，没有记录的格式默认支持所有转换
export const FORMAT_CONVERSION_MAP: Partial<
	Record<ImageFormatType, ImageFormatType[]>
> = {
	// WebP格式不能转换到任何其他格式（包括自身）
	[ImageFormat.WEBP]: Object.values(ImageFormat) as ImageFormatType[],
	// ICO格式限制：不支持转换为某些专业格式
	[ImageFormat.ICO]: [
		ImageFormat.DPX,
		ImageFormat.EXR,
		ImageFormat.PPM,
		ImageFormat.PGM,
		ImageFormat.PBM,
		ImageFormat.PAM,
		ImageFormat.SGI,
		ImageFormat.XBM,
	],
	// 示例：某些格式可能不支持转换为特定格式
	// [ImageFormat.GIF]: [ImageFormat.AVIF], // GIF不支持转换为AVIF
	// [ImageFormat.BMP]: [ImageFormat.WEBP], // BMP不支持转换为WebP
};

/**
 * 检查格式转换是否被支持，如果不支持则设置cannotDo标记
 * @param input 输入文件信息
 * @param targetFormat 目标格式
 * @returns 是否可以进行转换（总是返回true，但会设置cannotDo标记）
 */
export function checkFormatConversion(
	input: any,
	targetFormat: ImageFormatType,
): boolean {
	const sourceFormat = input.format?.toLowerCase() as ImageFormatType;

	// 检查是否在不支持转换的映射表中
	const unsupportedTargets = FORMAT_CONVERSION_MAP[sourceFormat];
	const isUnsupported = unsupportedTargets?.includes(targetFormat);
	if (isUnsupported) {
		// 设置cannotDo标记，表示这个文件应该在处理时被跳过
		input.cannotDo = true;
		console.warn(
			`格式转换不支持: ${sourceFormat} -> ${targetFormat}，文件将被跳过`,
		);
	} else {
		// 确保cannotDo为false
		input.cannotDo = false;
	}

	// 总是返回true，允许文件被添加到处理队列
	return true;
}
