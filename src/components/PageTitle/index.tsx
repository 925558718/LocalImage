"use client";
import React from "react";
import styles from "../animation/animation.module.scss";

interface FeatureTag {
	icon?: React.ReactNode;
	text: string;
	color?: "green" | "blue" | "purple" | "orange" | "red";
}

interface PageTitleProps {
	title: string;
	description?: string;
	features?: FeatureTag[];
	className?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({
	title,
	description,
	features = [],
	className = "",
}) => {
	const getColorClasses = (color: string) => {
		const colorMap = {
			green: "bg-green-400",
			blue: "bg-blue-400",
			purple: "bg-purple-400",
			orange: "bg-orange-400",
			red: "bg-red-400",
		};
		return colorMap[color as keyof typeof colorMap] || "bg-blue-400";
	};

	const getTitleClassName = () => {
		return `${styles["animation-title"]} mb-3 text-center`;
	};

	return (
		<div className={`text-center space-y-6 pt-20 ${className}`}>
			<h1 className={getTitleClassName()}>{title}</h1>

			{description && (
				<p className="font-OS text-lg opacity-80 text-center max-w-2xl mx-auto leading-relaxed">
					{description}
				</p>
			)}

			{/* Feature highlights */}
			{features.length > 0 && (
				<div className="flex flex-wrap justify-center gap-3">
					{features.map((feature) => (
						<div
							key={`${feature.text}-${feature.color || "default"}`}
							className="flex items-center gap-2 bg-white/20 dark:bg-black/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm"
						>
							{feature.icon || (
								<div
									className={`w-2 h-2 ${getColorClasses(feature.color || "blue")} rounded-full animate-pulse`}
								/>
							)}
							<span>{feature.text}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default PageTitle;
