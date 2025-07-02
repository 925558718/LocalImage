import { registerCropStrategy } from "../index";
import { DefaultCropStrategy } from "./DefaultCropStrategy";

// 注册默认裁剪策略
const defaultCropStrategy = new DefaultCropStrategy();
registerCropStrategy(defaultCropStrategy);

// 导出策略类
export { DefaultCropStrategy } from "./DefaultCropStrategy";

// 导出类型和函数
export type { CropStrategy, CropOptions } from "../index";
export { generateFFMPEGCommand } from "../index";
export { convertFilesToInputFileType } from "../../fileUtils";
