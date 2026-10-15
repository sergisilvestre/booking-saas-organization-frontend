
"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { CONFIG_OPTIONS_STORAGE_KEY, USER_LANGUAGE_STORAGE_KEY } from "@/lib/storage-keys";

type ConfigOptions = {
    languages: string[];
    default_language: string;
};

function getBrowserLanguage(languages: string[]): string | null {
    const browserLanguages = navigator.languages?.length
        ? navigator.languages
        : [navigator.language];

    for (const browserLanguage of browserLanguages) {
        const language = browserLanguage.toLowerCase().split("-")[0];

        if (languages.includes(language)) {
            return language;
        }
    }

    return null;
}

function getLocalizedPath(pathname: string, newLang: string): string {
    const segments = pathname.split("/");

    if (segments.length > 1 && segments[1]) {
        segments[1] = newLang;
    } else {
        segments[1] = newLang;
    }

    return segments.join("/");
}

export default function LanguageSwitcher({
    currentLang,
}: {
    currentLang: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [languages, setLanguages] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState(currentLang);

    useEffect(() => {
        setSelectedLanguage(currentLang);
    }, [currentLang]);

    useEffect(() => {
        let cancelled = false;

        function initializeLanguage() {
            try {
                const storedOptions = localStorage.getItem(
                    CONFIG_OPTIONS_STORAGE_KEY,
                );

                if (!storedOptions) {
                    console.error(
                        "Configuration options not found in localStorage.",
                    );
                    return;
                }

                const config = JSON.parse(storedOptions) as ConfigOptions;

                if (
                    !Array.isArray(config.languages) ||
                    config.languages.length === 0
                ) {
                    console.error("Invalid configuration languages.");
                    return;
                }

                if (cancelled) return;

                setLanguages(config.languages);

                const storedLanguage = localStorage.getItem(
                    USER_LANGUAGE_STORAGE_KEY,
                );

                const language =
                    storedLanguage &&
                        config.languages.includes(storedLanguage)
                        ? storedLanguage
                        : getBrowserLanguage(config.languages) ??
                        config.default_language;

                if (!config.languages.includes(language)) {
                    return;
                }

                localStorage.setItem(USER_LANGUAGE_STORAGE_KEY, language);

                if (language !== currentLang) {
                    router.replace(
                        getLocalizedPath(pathname, language),
                        { scroll: false },
                    );
                }
            } catch (error) {
                console.error(
                    "Unable to initialize language:",
                    error,
                );
            }
        }

        initializeLanguage();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const newLang = event.target.value;

            if (
                !languages.includes(newLang) ||
                newLang === currentLang
            ) {
                return;
            }

            // Persist the preference immediately.
            localStorage.setItem(USER_LANGUAGE_STORAGE_KEY, newLang);
            setSelectedLanguage(newLang);

            const localizedPath = getLocalizedPath(pathname, newLang);
            const queryString = searchParams.toString();
            const destination = queryString
                ? `${localizedPath}?${queryString}`
                : localizedPath;

            // Navigate immediately; no API request is needed here.
            router.replace(destination, { scroll: false });
        },
        [languages, currentLang, pathname, searchParams, router],
    );

    if (languages.length === 0) {
        return null;
    }

    return (
        <select
            value={selectedLanguage}
            onChange={handleChange}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-gray-400"
            aria-label="Select language"
        >
            {languages.map((language) => (
                <option key={language} value={language}>
                    {language.toUpperCase()}
                </option>
            ))}
        </select>
    );
}
