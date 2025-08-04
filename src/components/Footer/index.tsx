"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

function Footer() {
	const t = useTranslations();
	return (
		<footer className="w-full bg-background/80 backdrop-blur-xl border-t border-border/50 shadow-lg shadow-black/5">
			<div className="max-w-7xl mx-auto px-4 py-16 relative">
				{/* 微妙的背景纹理 */}
				<div className="absolute inset-0 bg-gradient-to-br from-transparent via-muted/20 to-transparent pointer-events-none" />
				<div className="relative z-10">
					{/* 主要内容区域 */}
					<div className="grid md:grid-cols-4 gap-8 mb-12">
						{/* 关于LocalImage */}
						<div className="md:col-span-2">
							<h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
								<span className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center text-primary-foreground text-sm font-bold mr-3">
									L
								</span>
								LocalImage {t("nav_convert")}
							</h3>
							<p className="text-muted-foreground mb-4 leading-relaxed">
								{t("compress_desc")}
							</p>
							<p className="text-muted-foreground mb-4 leading-relaxed">
								{t("desc")}
							</p>
							<div className="flex flex-wrap items-center justify-center gap-4 text-sm">
								<span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
									{t("privacy_protection")}
								</span>
								<span className="px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-sm">
									{t("local_processing")}
								</span>
								<span className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-sm">
									{t("free_to_use")}
								</span>
							</div>
						</div>

						{/* 核心功能 */}
						<div>
							<h4 className="text-lg font-semibold text-foreground mb-4">
								{t("core_features")}
							</h4>
							<ul className="space-y-2 text-muted-foreground">
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
									{t("nav_convert")}
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
									{t("image_format_conversion")}
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
									{t("batch_processing")}
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
									{t("high_quality")}
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
									{t("real_time_preview")}
								</li>
							</ul>
						</div>

						{/* 快速链接 */}
						<div>
							<h4 className="text-lg font-semibold text-foreground mb-4">
								{t("related_tools")}
							</h4>
							<ul className="space-y-2">
								<li>
									<Link
										href="https://limgx.com"
										className="text-muted-foreground hover:text-primary transition-colors"
									>
										{t("nav_convert")}
									</Link>
								</li>
								<li>
									<Link
										href="https://limgx.com/animation"
										className="text-muted-foreground hover:text-primary transition-colors"
									>
										WebP{t("animation_composer")}
									</Link>
								</li>
								<li>
									<Link
										href="https://tools.limgx.com"
										className="text-muted-foreground hover:text-primary transition-colors"
									>
										{t("developer_tools")}
									</Link>
								</li>
							</ul>
						</div>
					</div>

					{/* 技术说明和SEO内容 */}
					<div className="grid md:grid-cols-2 gap-8 mb-12 pt-8 border-t border-border">
						<div>
							<h4 className="text-lg font-semibold text-foreground mb-4">
								{t("technical_advantages")}
							</h4>
							<div className="text-muted-foreground space-y-3">
								<p>
									<strong className="text-foreground">
										{t("webassembly_acceleration")}：
									</strong>
									{t("local_processing_desc")}
								</p>
								<p>
									<strong className="text-foreground">
										{t("local_processing")}：
									</strong>
									{t("privacy_processing_desc")}
								</p>
								<p>
									<strong className="text-foreground">
										{t("high_quality_output")}：
									</strong>
									{t("high_quality_desc")}
								</p>
								<p>
									<strong className="text-foreground">
										{t("cross_platform")}：
									</strong>
									{t("cross_platform_desc")}
								</p>
							</div>
						</div>
						<div>
							<h4 className="text-lg font-semibold text-foreground mb-4">
								{t("usage_scenarios")}
							</h4>
							<div className="text-muted-foreground space-y-3">
								<p>
									<strong className="text-foreground">
										{t("web_design")}：
									</strong>
									{t("web_design_desc")}
								</p>
								<p>
									<strong className="text-foreground">
										{t("social_media")}：
									</strong>
									{t("social_media_desc")}
								</p>
								<p>
									<strong className="text-foreground">
										{t("ecommerce_display")}：
									</strong>
									{t("ecommerce_desc")}
								</p>
								<p>
									<strong className="text-foreground">
										{t("education_training")}：
									</strong>
									{t("education_desc")}
								</p>
							</div>
						</div>
					</div>

					{/* 底部信息 */}
					<div className="pt-8 border-t border-border">
						<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
							<div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
								<p className="text-muted-foreground text-sm">
									© 2024 LocalImage. {t("copyright_text")}.
								</p>
								<div className="flex items-center space-x-4 text-sm">
									<a
										href="mailto:yugwhite@outlook.com"
										className="text-muted-foreground hover:text-primary transition-colors"
									>
										{t("contact_us")}
									</a>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2 text-sm text-muted-foreground">
									<span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
									<span>{t("footer_status_1")}</span>
								</div>
								<div className="flex items-center space-x-2 text-sm text-muted-foreground">
									<span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
									<span>{t("footer_status_2")}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
