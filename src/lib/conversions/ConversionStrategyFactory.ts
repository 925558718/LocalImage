import {
	ConversionStrategy,
	FORMAT_CONVERSION_MAP,
	ImageFormat,
	ImageFormatType,
} from "./ConversionStrategy";

import { WebPConversionStrategy, DefaultConversionStrategy } from "./index";
import { PngConversionStrategy } from "./PngConversionStrategy";
import { IcoConversionStrategy } from "./IcoConversionStrategy";

/**
 * 图像转换策略工厂
 * 根据输出格式创建相应的转换策略实例
 */
// 使用命名空间和函数替代静态类
export namespace ConversionStrategyFactory {
	const strategies: Partial<Record<ImageFormatType, ConversionStrategy>> & {
		default: ConversionStrategy;
	} = {
		webp: new WebPConversionStrategy(),
		png: new PngConversionStrategy(),
		ico: new IcoConversionStrategy(),
		default: new DefaultConversionStrategy(),
	};

	/**
	 * 获取适合指定格式的转换策略
	 * @param format 输出格式
	 * @returns 对应的转换策略实现
	 */
	export function getStrategy(format: ImageFormatType): ConversionStrategy {
		return strategies[format] || strategies.default;
	}

	/**
	 * 检查是否支持从一种格式转换到另一种格式
	 * @param sourceFormat 源格式
	 * @param targetFormat 目标格式
	 * @returns 是否支持转换
	 */
	export function canConvert(
		sourceFormat: string,
		targetFormat: string,
	): boolean {
		const source = sourceFormat.toLowerCase() as ImageFormatType;
		const target = targetFormat.toLowerCase() as ImageFormatType;

		// 检查是否在不可转换映射中
		const unsupportedTargets = FORMAT_CONVERSION_MAP[source];
		if (unsupportedTargets?.includes(target)) {
			return false;
		}

		// 如果没有记录在不可转换映射中，则默认支持转换
		return true;
	}

	/**
	 * 获取所有支持的格式
	 * @returns 所有支持的格式数组
	 */
	export function getSupportedFormats(): ImageFormatType[] {
		return Object.values(ImageFormat);
	}
}
