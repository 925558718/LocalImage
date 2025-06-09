"use client";
import React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import BugsnagPerformance from "@bugsnag/browser-performance";

if (typeof window !== "undefined") {
	Bugsnag.start({
		apiKey: "841d9857e90394f3e59323ad57e3795c",
		plugins: [new BugsnagPluginReact()],
	});
	BugsnagPerformance.start({ apiKey: "841d9857e90394f3e59323ad57e3795c" });
    console.log("Bugsnag initialized");
}

const ErrorBoundary = Bugsnag?.getPlugin("react")?.createErrorBoundary(React);

const BugsnagErrorBoundary = ({ children }: { children: React.ReactNode }) => {
	// 如果ErrorBoundary未定义，直接返回children
	if (!ErrorBoundary) {
		return <>{children}</>;
	}
	return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default BugsnagErrorBoundary;