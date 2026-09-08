export const TIMEZONES = [
  "Europe/London",
  "Europe/Madrid",
  "Europe/Lisbon",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Warsaw",
  "Europe/Helsinki",
  "Europe/Athens",
  "Europe/Bucharest",
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
