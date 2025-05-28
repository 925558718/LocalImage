"use client";

import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button, Textarea } from "@/components/shadcn";

function JsonFormatterPage() {
	const { t } = useI18n();
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	const [error, setError] = useState("");

	const formatJson = () => {
		try {
			setError("");
			const parsed = JSON.parse(input);
			const formatted = JSON.stringify(parsed, null, 2);
			setOutput(formatted);
		} catch (err) {
			setError("Invalid JSON format");
			setOutput("");
		}
	};

	const minifyJson = () => {
		try {
			setError("");
			const parsed = JSON.parse(input);
			const minified = JSON.stringify(parsed);
			setOutput(minified);
		} catch (err) {
			setError("Invalid JSON format");
			setOutput("");
		}
	};

	const clearAll = () => {
		setInput("");
		setOutput("");
		setError("");
	};

	return (
		<main className="w-full h-full flex flex-col items-center min-h-[calc(100vh-4rem)] pb-[56px] pt-8">
			<div className="min-h-[20vh] flex items-center justify-center flex-col">
				<div className="text-[40px] uppercase">{t("nav_json_formatter")}</div>
				<div className="font-OS text-[12px] opacity-60 text-center">
					{t("json_formatter_desc")}
				</div>
			</div>

			<div className="w-full max-w-6xl px-4">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* 输入区域 */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">输入 JSON</h3>
							<div className="space-x-2">
								<Button onClick={formatJson} variant="default" size="sm">
									格式化
								</Button>
								<Button onClick={minifyJson} variant="outline" size="sm">
									压缩
								</Button>
								<Button onClick={clearAll} variant="outline" size="sm">
									清空
								</Button>
							</div>
						</div>
						<Textarea
							value={input}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
							placeholder="粘贴或输入 JSON 数据..."
							className="min-h-[400px] font-mono text-sm"
						/>
						{error && (
							<div className="text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded-md">
								{error}
							</div>
						)}
					</div>

					{/* 输出区域 */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">格式化结果</h3>
							{output && (
								<Button
									onClick={() => navigator.clipboard.writeText(output)}
									variant="outline"
									size="sm"
								>
									复制
								</Button>
							)}
						</div>
						<Textarea
							value={output}
							readOnly
							placeholder="格式化后的 JSON 将显示在这里..."
							className="min-h-[400px] font-mono text-sm bg-muted/50"
						/>
					</div>
				</div>

				{/* 使用说明 */}
				<div className="mt-8 bg-card border rounded-lg p-6">
					<h4 className="text-lg font-semibold mb-4">使用说明</h4>
					<ul className="space-y-2 text-sm text-muted-foreground">
						<li>• 在左侧输入框中粘贴或输入 JSON 数据</li>
						<li>• 点击&quot;格式化&quot;按钮美化 JSON 格式</li>
						<li>• 点击&quot;压缩&quot;按钮移除多余空格和换行</li>
						<li>• 所有处理都在本地完成，不会上传到服务器</li>
					</ul>
				</div>
			</div>
		</main>
	);
}

export default JsonFormatterPage; 