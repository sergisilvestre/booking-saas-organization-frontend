"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type ConfigOptions = {
    languages: string[];
    default_language: string;
};

const CONFIG_OPTIONS_STORAGE_KEY = "config_options";
const USER_LANGUAGE_STORAGE_KEY = "user_language";

function getBrowserLanguage(
    languages: string[]
): string | null {
    const browserLanguages = navigator.languages?.length
        ? navigator.languages
        : [navigator.language];

    for (const browserLanguage of browserLanguages) {
        const language = browserLanguage
            .toLowerCase()
            .split("-")[0];

        if (languages.includes(language)) {
            return language;
        }
    }

    return null;
}

export default function LanguageSwitcher({
    currentLang,
}: {
    currentLang: string;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const [languages, setLanguages] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] =
        useState(currentLang);

    useEffect(() => {
        const initializeLanguage = (
            config: ConfigOptions
        ) => {
            setLanguages(config.languages);

            const storedLanguage = localStorage.getItem(
                USER_LANGUAGE_STORAGE_KEY
            );

            /*
             * The user already has a stored language preference.
             * Always use it instead of detecting the browser language.
             */
            if (
                storedLanguage &&
                config.languages.includes(storedLanguage)
            ) {
                setSelectedLanguage(storedLanguage);

                /*
                 * Keep the URL locale synchronized with the
                 * stored language preference.
                 */
                if (storedLanguage !== currentLang) {
                    const segments = pathname.split("/");

                    segments[1] = storedLanguage;

                    router.replace(segments.join("/"));
                }

                return;
            }

            /*
             * First visit:
             * detect the browser language.
             */
            const browserLanguage = getBrowserLanguage(
                config.languages
            );

            const language =
                browserLanguage ?? config.default_language;

            localStorage.setItem(
                USER_LANGUAGE_STORAGE_KEY,
                language
            );

            setSelectedLanguage(language);

            /*
             * Redirect to the same route using the detected
             * language when it differs from the current locale.
             *
             * Example:
             * /ca/dashboard -> /en/dashboard
             */
            if (language !== currentLang) {
                const segments = pathname.split("/");

                segments[1] = language;

                router.replace(segments.join("/"));
            }
        };

        const storedOptions = localStorage.getItem(
            CONFIG_OPTIONS_STORAGE_KEY
        );

        if (storedOptions) {
            try {
                const config: ConfigOptions =
                    JSON.parse(storedOptions);

                initializeLanguage(config);

                return;
            } catch {
                localStorage.removeItem(
                    CONFIG_OPTIONS_STORAGE_KEY
                );
            }
        }

        const loadLanguages = async () => {
            try {
                const response = await apiFetch(
                    "config/options",
                    {
                        auth: false,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load config options"
                    );
                }

                const config: ConfigOptions =
                    await response.json();

                localStorage.setItem(
                    CONFIG_OPTIONS_STORAGE_KEY,
                    JSON.stringify(config)
                );

                initializeLanguage(config);
            } catch {
                setLanguages([]);
            }
        };

        loadLanguages();
    }, [currentLang, pathname, router]);

    const handleChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const newLang = event.target.value;

        localStorage.setItem(
            USER_LANGUAGE_STORAGE_KEY,
            newLang
        );

        setSelectedLanguage(newLang);

        const segments = pathname.split("/");

        segments[1] = newLang;

        router.push(segments.join("/"));
    };

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
                <option
                    key={language}
                    value={language}
                >
                    {language.toUpperCase()}
                </option>
            ))}
        </select>
    );
}