// 压缩结果类型定义
export interface CompressionResult {
	url: string;
	name: string;
	originalSize: number;
	compressedSize: number;
	processingTime: number;
	format: string;
	quality: number;
}

// 文件输入类型定义
export interface FileInput {
	data: ArrayBuffer;
	name: string;
	originalSize: number;
}

// 压缩选项类型定义
export interface CompressionOptions {
	format: string;
	quality?: number;
	width?: number;
	height?: number;
}

// 进度回调类型定义
export interface ProgressCallbacks {
	onProgress?: (completed: number, total: number) => void;
	onFileComplete?: (result: CompressionResult) => void;
}
