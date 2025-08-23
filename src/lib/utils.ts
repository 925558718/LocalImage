import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
	ImageFormat,
	ImageFormatType,
} from "./strategy/conversions/ConversionStrategy";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isBrowser() {
	return typeof window !== "undefined";
}

export function isMobile() {
	return isBrowser() && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function getType(file_name: string): ImageFormatType {
	const format = file_name.split(".").pop()?.toLowerCase();

	if (!format) {
		throw new Error(`无法从文件名 ${file_name} 中提取格式`);
	}

	// 检查格式是否在支持的格式列表中
	const supportedFormats = Object.values(ImageFormat) as ImageFormatType[];
	if (!supportedFormats.includes(format as ImageFormatType)) {
		throw new Error(`不支持的图片格式: ${format}`);
	}

	return format as ImageFormatType;
}

export function isLocal() {
	return process.env.NODE_ENV === "development";
}