"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid/index.js";
import timeGridPlugin from "@fullcalendar/timegrid/index.js";
import interactionPlugin from "@fullcalendar/interaction/index.js";
import type {
    CalendarApi,
    DatesSetArg,
} from "@fullcalendar/core/index.js";


type Props = {
    lang: string;
};

type CalendarView =
    | "dayGridMonth"
    | "timeGridWeek"
    | "timeGridDay";

export default function CalendarPage({ lang }: Props) {
    const t = useTranslations("dashboard.calendar");

    const calendarApiRef = useRef<CalendarApi | null>(null);

    const [currentTitle, setCurrentTitle] = useState("");
    const [currentView, setCurrentView] =
        useState<CalendarView>("dayGridMonth");

    function getCalendar(): CalendarApi | null {
        return calendarApiRef.current;
    }

    function goToday() {
        getCalendar()?.today();
    }

    function goPrevious() {
        getCalendar()?.prev();
    }

    function goNext() {
        getCalendar()?.next();
    }

    function changeView(view: CalendarView) {
        getCalendar()?.changeView(view);
        setCurrentView(view);
    }

    function handleDatesSet(info: DatesSetArg) {
        setCurrentTitle(info.view.title);
        setCurrentView(info.view.type as CalendarView);
    }

    function handleDateClick(info: { dateStr: string }) {
        console.log("Selected date:", info.dateStr);
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        {t("title")}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {t("subtitle")}
                    </p>
                </div>

                <button
                    type="button"
                    className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                    {t("createBooking")}
                </button>
            </div>

            {/* Calendar */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                {/* Toolbar */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={goToday}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            {t("today")}
                        </button>

                        <button
                            type="button"
                            onClick={goPrevious}
                            aria-label={t("previous")}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                            ←
                        </button>

                        <button
                            type="button"
                            onClick={goNext}
                            aria-label={t("next")}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                            →
                        </button>
                    </div>

                    {/* Current date */}
                    <div className="text-center text-base font-semibold text-gray-900">
                        {currentTitle}
                    </div>

                    {/* Views */}
                    <div className="flex items-center justify-center gap-1 rounded-lg bg-gray-100 p-1">
                        <button
                            type="button"
                            onClick={() =>
                                changeView("dayGridMonth")
                            }
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${currentView === "dayGridMonth"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:bg-white hover:text-gray-900"
                                }`}
                        >
                            {t("month")}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                changeView("timeGridWeek")
                            }
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${currentView === "timeGridWeek"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:bg-white hover:text-gray-900"
                                }`}
                        >
                            {t("week")}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                changeView("timeGridDay")
                            }
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${currentView === "timeGridDay"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:bg-white hover:text-gray-900"
                                }`}
                        >
                            {t("day")}
                        </button>
                    </div>
                </div>

                <FullCalendar
                    ref={(calendar) => {
                        calendarApiRef.current =
                            calendar?.getApi() ?? null;
                    }}
                    plugins={[
                        dayGridPlugin,
                        timeGridPlugin,
                        interactionPlugin,
                    ]}
                    initialView="dayGridMonth"
                    locale={lang}
                    firstDay={1}
                    height="auto"
                    headerToolbar={false}
                    selectable
                    dayMaxEvents
                    fixedWeekCount={false}
                    datesSet={handleDatesSet}
                    dateClick={handleDateClick}
                    events={[]}
                />
            </div>
        </div>
    );
}