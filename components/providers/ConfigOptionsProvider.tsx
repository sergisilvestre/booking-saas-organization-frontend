"use client";

import { useEffect, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

const CONFIG_OPTIONS_STORAGE_KEY = "config_options";
const TIMEZONES_STORAGE_KEY = "timezones";
const CURRENCIES_STORAGE_KEY = "currencies";

type ConfigOptions = {
    languages: string[];
    default_language: string;
    timezones: string[];
    default_timezone: string;
    currencies: string[];
    default_currency: string;
};

type Props = {
    children: ReactNode;
};

export function ConfigOptionsProvider({ children }: Props) {
    useEffect(() => {
        let cancelled = false;

        async function loadConfigOptions() {
            try {
                const storedConfig = localStorage.getItem(
                    CONFIG_OPTIONS_STORAGE_KEY,
                );

                if (storedConfig) {
                    try {
                        const data: ConfigOptions = JSON.parse(storedConfig);

                        const isValid =
                            Array.isArray(data.languages) &&
                            typeof data.default_language === "string" &&
                            Array.isArray(data.timezones) &&
                            typeof data.default_timezone === "string" &&
                            Array.isArray(data.currencies) &&
                            typeof data.default_currency === "string";

                        if (isValid) {
                            // La configuración ya está guardada.
                            // No hacemos ninguna request.
                            return;
                        }
                    } catch {
                        // JSON inválido: recuperamos la configuración desde la API.
                    }
                }

                const response = await apiFetch("config/options", {
                    method: "GET",
                    auth: false,
                    showLoading: false,
                });

                if (!response.ok) {
                    throw new Error(
                        `Failed to load configuration options: ${response.status}`,
                    );
                }

                const data: ConfigOptions = await response.json();

                if (cancelled) return;

                localStorage.setItem(
                    CONFIG_OPTIONS_STORAGE_KEY,
                    JSON.stringify(data),
                );

                localStorage.setItem(
                    TIMEZONES_STORAGE_KEY,
                    JSON.stringify(data.timezones ?? []),
                );

                localStorage.setItem(
                    CURRENCIES_STORAGE_KEY,
                    JSON.stringify(data.currencies ?? []),
                );
            } catch (error) {
                console.error(
                    "Error loading configuration options:",
                    error,
                );
            }
        }

        void loadConfigOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    return children;
}