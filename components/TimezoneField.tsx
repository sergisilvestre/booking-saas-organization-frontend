"use client";

import { useMemo } from "react";

type Props = {
    value: string;
    onChange: (timezone: string) => void;
    name?: string;
    id?: string;
    label?: string;
    disabled?: boolean;
};

const TIMEZONES = [
    "Europe/Madrid",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Rome",
    "Europe/Lisbon",
    "Europe/Amsterdam",
    "Europe/Brussels",
    "Europe/Zurich",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Mexico_City",
    "America/Bogota",
    "America/Sao_Paulo",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Singapore",
    "Asia/Kolkata",
    "Australia/Sydney",
    "Pacific/Auckland",
];

function getUtcOffset(timeZone: string): string {
    const date = new Date();

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "longOffset",
    }).formatToParts(date);

    const offset = parts.find(
        (part) => part.type === "timeZoneName"
    )?.value;

    return offset?.replace("GMT", "UTC") ?? "UTC";
}

export default function TimezoneField({
    value,
    onChange,
    name = "timezone",
    id = "timezone",
    label,
    disabled = false,
}: Props) {
    const timezones = useMemo(
        () =>
            TIMEZONES.map((timezone) => ({
                value: timezone,
                label: `${timezone} (${getUtcOffset(timezone)})`,
            })),
        []
    );

    return (
        <div>
            {label && (
                <label
                    htmlFor={id}
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    {label}
                </label>
            )}

            <select
                id={id}
                name={name}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
            >
                {timezones.map((timezone) => (
                    <option
                        key={timezone.value}
                        value={timezone.value}
                    >
                        {timezone.label}
                    </option>
                ))}
            </select>
        </div>
    );
}