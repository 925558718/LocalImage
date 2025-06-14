"use client"
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

function Footer() {
	const t = useTranslations();
	return (
		<footer className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/50 shadow-lg shadow-black/5">
			<div className="max-w-7xl mx-auto px-4 py-16 relative">
				{/* 微妙的背景纹理 */}
				<div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-100/20 to-transparent dark:from-transparent dark:via-slate-800/20 dark:to-transparent pointer-events-none"/>
				<div className="relative z-10">
					{/* 主要内容区域 */}
					<div className="grid md:grid-cols-4 gap-8 mb-12">
						{/* 关于LocalImage */}
						<div className="md:col-span-2">
							<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
								<span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">L</span>
								LocalImage WebP{t("animation_composer")}
							</h3>
							<p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
								{t("desc")}
							</p>
							<p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
								{t("animation_desc")}
							</p>
							<div className="flex flex-wrap gap-2 mb-4">
								<span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">{t("local_processing")}</span>
								<span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">{t("privacy_protection")}</span>
								<span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">{t("free_to_use")}</span>
								<span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">{t("real_time_preview")}</span>
							</div>
						</div>

						{/* 核心功能 */}
						<div>
							<h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t("core_features")}</h4>
							<ul className="space-y-2 text-slate-600 dark:text-slate-300">
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"/>
									WebP{t("animation_composer")}
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"/>
									{t("gif_animation")}
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"/>
									{t("image_format_conversion")}
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"/>
									{t("nav_compress")}
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"/>
									{t("batch_processing")}
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"/>
									{t("nav_gradient_generator")}
								</li>
							</ul>
						</div>

						{/* 快速链接 */}
						<div>
							<h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t("related_tools")}</h4>
							<ul className="space-y-2">
								<li>
									<Link href="https://limgx.com" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
										WebP{t("animation_composer")}
									</Link>
								</li>
								<li>
									<Link href="https://limgx.com/compress" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
										{t("nav_compress")}
									</Link>
								</li>
								<li>
									<Link href="https://limgx.com/dev/gradient" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
										{t("nav_gradient_generator")}
									</Link>
								</li>
							</ul>
						</div>
					</div>

					{/* 技术说明和SEO内容 */}
					<div className="grid md:grid-cols-2 gap-8 mb-12 pt-8 border-t border-slate-200 dark:border-slate-700">
						<div>
							<h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t("technical_advantages")}</h4>
							<div className="text-slate-600 dark:text-slate-300 space-y-3">
								<p>
									<strong className="text-slate-800 dark:text-slate-200">{t("webassembly_acceleration")}：</strong>
									{t("local_processing_desc")}
								</p>
								<p>
									<strong className="text-slate-800 dark:text-slate-200">{t("local_processing")}：</strong>
									{t("privacy_processing_desc")}
								</p>
								<p>
									<strong className="text-slate-800 dark:text-slate-200">{t("high_quality_output")}：</strong>
									{t("high_quality_desc")}
								</p>
								<p>
									<strong className="text-slate-800 dark:text-slate-200">{t("cross_platform")}：</strong>
									{t("cross_platform_desc")}
								</p>
							</div>
						</div>
						<div>
							<h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t("usage_scenarios")}</h4>
							<div className="text-slate-600 dark:text-slate-300 space-y-3">
								<p>
									<strong className="text-slate-800 dark:text-slate-200">{t("web_design")}：</strong>
									{t("web_design_desc")}
								</p>
								<p>
									<strong className="text-slate-800 dark:text-slate-200">{t("social_media")}：</strong>
									{t("social_media_desc")}
								</p>
								<p>
									<strong className="text-slate-800 dark:text-slate-200">{t("ecommerce_display")}：</strong>
									{t("ecommerce_desc")}
								</p>
								<p>
									<strong className="text-slate-800 dark:text-slate-200">{t("education_training")}：</strong>
									{t("education_desc")}
								</p>
							</div>
						</div>
					</div>

					{/* 底部信息 */}
					<div className="pt-8 border-t border-slate-200 dark:border-slate-700">
						<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
							<div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
								<p className="text-slate-600 dark:text-slate-300 text-sm">
									© 2024 LocalImage. {t("copyright_text")}.
								</p>
								<div className="flex items-center space-x-4 text-sm">
									<a href="mailto:yugwhite@outlook.com" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
										{t("contact_us")}
									</a>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
									<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
									<span>{t("footer_status_1")}</span>
								</div>
								<div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
									<span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"/>
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
