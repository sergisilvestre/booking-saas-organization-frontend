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

type BookingForm = {
    customerName: string;
    customerEmail: string;
    eventType: string;
    date: string;
    startTime: string;
    endTime: string;
    notes: string;
};

const initialForm: BookingForm = {
    customerName: "",
    customerEmail: "",
    eventType: "",
    date: "",
    startTime: "09:00",
    endTime: "09:30",
    notes: "",
};

export default function CalendarPage({ lang }: Props) {
    const t = useTranslations("dashboard.calendar");

    const calendarApiRef = useRef<CalendarApi | null>(null);

    const [currentTitle, setCurrentTitle] = useState("");
    const [currentView, setCurrentView] =
        useState<CalendarView>("dayGridMonth");

    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [form, setForm] = useState<BookingForm>(initialForm);

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

    function openBookingForm(date?: string) {
        setForm({
            ...initialForm,
            date: date ?? getTodayDate(),
        });

        setIsBookingFormOpen(true);
    }

    function closeBookingForm() {
        setIsBookingFormOpen(false);
    }

    function handleDateClick(info: { dateStr: string }) {
        openBookingForm(info.dateStr);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        console.log("Create booking:", form);

        // TODO:
        // POST /api/bookings
        //
        // await fetch("/api/bookings", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(form),
        // });

        closeBookingForm();
    }

    function updateForm(
        field: keyof BookingForm,
        value: string,
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
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
                    onClick={() => openBookingForm()}
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
                            className={`rounded - md px - 3 py - 1.5 text - sm font - medium transition ${currentView === "dayGridMonth"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                                } `}
                        >
                            {t("month")}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                changeView("timeGridWeek")
                            }
                            className={`rounded - md px - 3 py - 1.5 text - sm font - medium transition ${currentView === "timeGridWeek"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                                } `}
                        >
                            {t("week")}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                changeView("timeGridDay")
                            }
                            className={`rounded - md px - 3 py - 1.5 text - sm font - medium transition ${currentView === "timeGridDay"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                                } `}
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

            {/* Booking modal */}
            {isBookingFormOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onMouseDown={closeBookingForm}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {t("booking.title")}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {t("booking.subtitle")}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeBookingForm}
                                aria-label={t("booking.close")}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-5 px-6 py-6">
                                {/* Customer name */}
                                <div>
                                    <label
                                        htmlFor="customerName"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        {t("booking.customerName")}
                                    </label>

                                    <input
                                        id="customerName"
                                        type="text"
                                        value={form.customerName}
                                        onChange={(event) =>
                                            updateForm(
                                                "customerName",
                                                event.target.value,
                                            )
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                                {/* Customer email */}
                                <div>
                                    <label
                                        htmlFor="customerEmail"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        {t("booking.customerEmail")}
                                    </label>

                                    <input
                                        id="customerEmail"
                                        type="email"
                                        value={form.customerEmail}
                                        onChange={(event) =>
                                            updateForm(
                                                "customerEmail",
                                                event.target.value,
                                            )
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                                {/* Event type */}
                                <div>
                                    <label
                                        htmlFor="eventType"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        {t("booking.eventType")}
                                    </label>

                                    <select
                                        id="eventType"
                                        value={form.eventType}
                                        onChange={(event) =>
                                            updateForm(
                                                "eventType",
                                                event.target.value,
                                            )
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    >
                                        <option value="">
                                            {t("booking.selectEventType")}
                                        </option>

                                        <option value="consultation">
                                            {t("booking.consultation")}
                                        </option>

                                        <option value="training">
                                            {t("booking.training")}
                                        </option>

                                        <option value="meeting">
                                            {t("booking.meeting")}
                                        </option>
                                    </select>
                                </div>

                                {/* Date */}
                                <div>
                                    <label
                                        htmlFor="date"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        {t("booking.date")}
                                    </label>

                                    <input
                                        id="date"
                                        type="date"
                                        value={form.date}
                                        onChange={(event) =>
                                            updateForm(
                                                "date",
                                                event.target.value,
                                            )
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                                {/* Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="startTime"
                                            className="mb-1.5 block text-sm font-medium text-gray-700"
                                        >
                                            {t("booking.startTime")}
                                        </label>

                                        <input
                                            id="startTime"
                                            type="time"
                                            value={form.startTime}
                                            onChange={(event) =>
                                                updateForm(
                                                    "startTime",
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="endTime"
                                            className="mb-1.5 block text-sm font-medium text-gray-700"
                                        >
                                            {t("booking.endTime")}
                                        </label>

                                        <input
                                            id="endTime"
                                            type="time"
                                            value={form.endTime}
                                            onChange={(event) =>
                                                updateForm(
                                                    "endTime",
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label
                                        htmlFor="notes"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        {t("booking.notes")}
                                    </label>

                                    <textarea
                                        id="notes"
                                        rows={3}
                                        value={form.notes}
                                        onChange={(event) =>
                                            updateForm(
                                                "notes",
                                                event.target.value,
                                            )
                                        }
                                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeBookingForm}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    {t("booking.cancel")}
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    {t("booking.create")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function getTodayDate(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year} -${month} -${day} `;
}
