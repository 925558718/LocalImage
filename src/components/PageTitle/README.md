# PageTitle 组件

一个统一的页面标题组件，通过 `variant` 参数控制不同的样式效果，用于显示页面标题、描述和特性标签。

## 使用方法

```tsx
import { PageTitle } from "@/components";

// 默认样式（蓝紫渐变 + 动画）
<PageTitle 
  title="页面标题"
  description="页面描述"
/>

// 动画样式（彩虹渐变 + 特殊效果）
<PageTitle 
  title="动画页面标题"
  description="页面描述"
  variant="animated"
/>

// 带特性标签
<PageTitle 
  title="页面标题"
  description="页面描述"
  features={[
    { text: "特性1", color: "green" },
    { text: "特性2", color: "blue" },
    { text: "特性3", color: "purple" }
  ]}
  variant="animated"
/>

// 自定义样式
<PageTitle 
  title="页面标题"
  description="页面描述"
  className="mb-8"
  variant="default"
/>
```

## Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| title | string | - | 页面标题（必需） |
| description | string | - | 页面描述（可选） |
| features | FeatureTag[] | [] | 特性标签数组（可选） |
| className | string | "" | 自定义 CSS 类名（可选） |
| variant | "default" \| "animated" | "default" | 样式变体（可选） |

## FeatureTag 类型

```tsx
interface FeatureTag {
  icon?: React.ReactNode;  // 自定义图标（可选）
  text: string;            // 标签文本
  color?: "green" | "blue" | "purple" | "orange" | "red";  // 标签颜色
}
```

## 颜色选项

- `green`: 绿色标签
- `blue`: 蓝色标签  
- `purple`: 紫色标签
- `orange`: 橙色标签
- `red`: 红色标签

## 样式变体

### default 变体
- 蓝-紫-靛渐变文字
- 渐变动画效果
- 适用于：主页、压缩页面等标准页面

### animated 变体
- 彩虹七色渐变文字
- 更丰富的渐变动画
- 文字阴影和发光效果
- 适用于：动画页面等需要特殊视觉效果的功能页面

## 样式特点

- 响应式设计，支持移动端和桌面端
- 毛玻璃背景的特性标签
- 动画效果（脉冲动画）
- 深色模式支持
- 统一的组件接口，通过参数控制样式

## 使用场景

- **variant="default"**: 主页、压缩页面等标准页面
- **variant="animated"**: 动画页面等需要特殊视觉效果的功能页面 