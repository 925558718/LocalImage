/**
 * 统一的图片文件对象
 * 包含文件的所有相关信息和处理状态
 */
export interface InputFileType {
	id: string;
	inputName: string;
	// 基本文件信息
	name: string;
	outputName: string;
	originalFile: File;
	data?: ArrayBuffer;
	size: number;
	// 图片尺寸和元数据
	width?: number;
	height?: number;
	aspectRatio?: number;
	megapixels?: number;
	format?: string;
	hasAlpha?: boolean;
	isAnimated?: boolean;
	ffmpeg_command?: string[];
	cannotDo?: boolean;
	buffer?: Uint8Array;
}

export interface OutputType {
	name: string;
	url: string;
	size: number; // 文件大小（字节）
	width: number;
	height: number;
	processingTime: number; // 处理时长（毫秒）
	status: "success" | "error";
}

/**
 * 从File对象数组转换为InputFileType数组
 * @param files - File对象数组或FileList
 * @returns Promise<InputFileType[]> - 转换后的InputFileType数组
 */
export async function convertFilesToInputFileType(
	files: File[] | FileList,
): Promise<InputFileType[]> {
	const fileArray = Array.from(files);

	const promises = fileArray.map(async (file) => {
		const id = generateUniqueId();
		const format = getFileFormat(file.name);
		const filename = file.name.substring(
			0,
			file.name.length - format.length - 1,
		);
		const outputName = `${filename}_output.${format}`;
		const inputFile: InputFileType = {
			id,
			inputName: file.name,
			outputName: outputName,
			name: filename,
			originalFile: file,
			size: file.size,
			format,
		};

		// 读取文件的Uint8Array
		try {
			inputFile.buffer = await readFileAsUint8Array(file);
		} catch (error) {
			console.warn(`读取文件Uint8Array失败: ${file.name}`, error);
		}

		// 如果是图片文件，获取图片元数据
		if (isImageFile(file)) {
			try {
				const imageMetadata = await getImageMetadata(file);
				Object.assign(inputFile, imageMetadata);
			} catch (error) {
				console.warn(`获取图片元数据失败: ${file.name}`, error);
			}
		}

		return inputFile;
	});

	return Promise.all(promises);
}

/**
 * 生成唯一ID
 * @returns string - 唯一标识符
 */
function generateUniqueId(): string {
	// 使用时间戳 + 随机数 + 文件计数器确保唯一性
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 15);
	const counter = Math.floor(Math.random() * 1000);

	return `file_${timestamp}_${random}_${counter}`;
}

/**
 * 读取文件为Uint8Array
 * @param file - File对象
 * @returns Promise<Uint8Array> - 文件的Uint8Array数据
 */
async function readFileAsUint8Array(file: File): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			if (reader.result instanceof ArrayBuffer) {
				resolve(new Uint8Array(reader.result));
			} else {
				reject(new Error("读取文件失败：结果不是ArrayBuffer"));
			}
		};

		reader.onerror = () => {
			reject(new Error(`读取文件失败: ${file.name}`));
		};

		reader.readAsArrayBuffer(file);
	});
}

/**
 * 检查文件是否为图片文件
 * @param file - File对象
 * @returns boolean - 是否为图片文件
 */
function isImageFile(file: File): boolean {
	return file.type.startsWith("image/");
}

/**
 * 从文件名获取文件格式
 * @param fileName - 文件名
 * @returns string - 文件格式
 */
function getFileFormat(fileName: string): string {
	const extension = fileName.split(".").pop()?.toLowerCase() || "";
	return extension;
}

/**
 * 获取图片元数据
 * @param file - 图片文件
 * @returns Promise<Partial<InputFileType>> - 图片元数据
 */
async function getImageMetadata(file: File): Promise<Partial<InputFileType>> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);

		img.onload = () => {
			const width = img.naturalWidth;
			const height = img.naturalHeight;
			const aspectRatio = width / height;
			const megapixels = Math.round(((width * height) / 1000000) * 100) / 100;

			// 检查是否是动画文件
			const isAnimated = checkIfAnimated(file);

			URL.revokeObjectURL(url);

			resolve({
				width,
				height,
				aspectRatio,
				megapixels,
				isAnimated,
			});
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error(`无法加载图片: ${file.name}`));
		};

		img.src = url;
	});
}

/**
 * 检查图片是否为动画格式
 * @param file - 图片文件
 * @returns boolean - 是否为动画
 */
function checkIfAnimated(file: File): boolean {
	const animatedFormats = ["gif", "webp", "apng"];
	const format = getFileFormat(file.name);
	return animatedFormats.includes(format);
}
