"use client";
// src/contexts/TranslationContext.tsx
import { createContext, useContext, useRef } from "react";
import type { ReactNode } from "react";
import { get } from "radash";
export type Dictionary = {
	[key: string]: string | number | boolean | null | undefined | Dictionary | Dictionary[];
};
const TranslationContext = createContext<Dictionary>({});

function useI18n() {
	const dict = useContext(TranslationContext);
	function t(key: string, fallback?: string) {
		const value = get(dict, key);
		if (value === undefined || value === null) return fallback ?? key;
		return String(value);
	}
	return { t, dict };
}
export interface StoreProviderProps {
	children: ReactNode;
	value: Dictionary;
}

const TranslationProvider = ({ children, value }: StoreProviderProps) => {
	const storeRef = useRef<Dictionary>(null);
	if (!storeRef.current) {
		storeRef.current = value;
	}
	return (
		<TranslationContext value={storeRef.current}>{children}</TranslationContext>
	);
};

export { TranslationContext, useI18n, TranslationProvider };
