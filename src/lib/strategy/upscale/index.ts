import { DefaultUpscaleStrategy } from "./DefaultUpscaleStrategy";
import { registerUpscaleStrategy } from "../index";

// 注册默认放大策略
const defaultUpscaleStrategy = new DefaultUpscaleStrategy();
registerUpscaleStrategy(defaultUpscaleStrategy);

// 导出策略类
export { DefaultUpscaleStrategy } from "./DefaultUpscaleStrategy";

// 导出类型和函数
export type { UpscaleStrategy, UpscaleOptions } from "../index";
export { generateFFMPEGCommand } from "../index";
export { convertFilesToInputFileType } from "../../fileUtils"; 