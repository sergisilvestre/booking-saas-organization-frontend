export const TIMEZONES = [
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Atlantic/Canary",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Brussels",
  "Europe/Amsterdam",
  "Europe/Luxembourg",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Vienna",
  "Europe/Prague",
  "Europe/Warsaw",
  "Europe/Copenhagen",
  "Europe/Stockholm",
  "Europe/Oslo",
  "Europe/Helsinki",
  "Europe/Athens",
  "Europe/Bucharest",
  "Europe/Sofia",
  "Europe/Zurich",
  "Europe/Istanbul",
  "Europe/Moscow",
] as const;

export function getTimezoneLabel(timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  });

  const parts = formatter.formatToParts(new Date());

  const offset =
    parts.find((part) => part.type === "timeZoneName")?.value ?? "";

  return `${timezone} (${offset.replace("GMT", "UTC")})`;
}
