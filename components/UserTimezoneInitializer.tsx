"use client";
import { useEffect } from "react";
const USER_TIMEZONE_STORAGE_KEY = "user_timezone";
export default function UserTimezoneInitializer() {
    useEffect(() => {
        const storedTimezone = localStorage.getItem(USER_TIMEZONE_STORAGE_KEY);
        if (storedTimezone) {
            return;
        }
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!timezone) {
            return;
        }
        localStorage.setItem(USER_TIMEZONE_STORAGE_KEY, timezone);
    }, []);
    return null;
}
