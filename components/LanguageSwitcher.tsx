"use client";

import { usePathname, useRouter } from "next/navigation";

const languages = [
    { code: "ca", label: "CA" },
    { code: "es", label: "ES" },
    { code: "en", label: "EN" },
];

export default function LanguageSwitcher({
    currentLang,
}: {
    currentLang: string;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = event.target.value;

        const segments = pathname.split("/");

        segments[1] = newLang;

        router.push(segments.join("/"));
    };

    return (
        <select
            value={currentLang}
            onChange={handleChange}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-gray-400"
            aria-label="Select language"
        >
            {languages.map((language) => (
                <option key={language.code} value={language.code}>
                    {language.label}
                </option>
            ))}
        </select>
    );
}