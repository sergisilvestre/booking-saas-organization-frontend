"use client";

import { useEffect, useRef, useState } from "react";
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

type Customer = {
    id: string;
    name: string;
    email: string;
};

type EventType = {
    id: string;
    name: string;
};

type BookingForm = {
    customerId: string;
    eventTypeId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes: string;
};

type CustomerForm = {
    name: string;
    email: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const initialForm: BookingForm = {
    customerId: "",
    eventTypeId: "",
    date: "",
    startTime: "09:00",
    endTime: "09:30",
    notes: "",
};

const initialCustomerForm: CustomerForm = {
    name: "",
    email: "",
};

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        ...(token
            ? {
                Authorization: `Bearer ${token}`,
            }
            : {}),
    };
}

export default function CalendarPage({ lang }: Props) {
    const t = useTranslations("dashboard.calendar");

    const calendarApiRef = useRef<CalendarApi | null>(null);

    const [currentTitle, setCurrentTitle] = useState("");
    const [currentView, setCurrentView] =
        useState<CalendarView>("dayGridMonth");

    const [isBookingFormOpen, setIsBookingFormOpen] =
        useState(false);

    const [form, setForm] =
        useState<BookingForm>(initialForm);

    /*
     * Customers
     */
    const [customers, setCustomers] =
        useState<Customer[]>([]);

    const [customerSearch, setCustomerSearch] =
        useState("");

    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);

    const [isCustomerSearchOpen, setIsCustomerSearchOpen] =
        useState(false);

    const [isCreateCustomerOpen, setIsCreateCustomerOpen] =
        useState(false);

    const [customerForm, setCustomerForm] =
        useState<CustomerForm>(initialCustomerForm);

    /*
     * Event types
     */
    const [eventTypes, setEventTypes] =
        useState<EventType[]>([]);

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

        setSelectedCustomer(null);
        setCustomerSearch("");
        setIsCustomerSearchOpen(false);

        setIsBookingFormOpen(true);
    }

    function closeBookingForm() {
        setIsBookingFormOpen(false);
        setIsCustomerSearchOpen(false);
        setIsCreateCustomerOpen(false);
    }

    function handleDateClick(info: { dateStr: string }) {
        openBookingForm(info.dateStr);
    }

    function updateBookingForm(
        field: keyof BookingForm,
        value: string,
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    /*
     * Load event types when the page loads.
     */
    useEffect(() => {
        async function loadEventTypes() {
            try {
                const response = await fetch(
                    `${API_URL}/api/organization/event-types`,
                    {
                        headers: getAuthHeaders(),
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load event types.",
                    );
                }

                const data = await response.json();

                setEventTypes(data.data ?? data);
            } catch (error) {
                console.error(error);
            }
        }

        loadEventTypes();
    }, []);

    /*
     * Search customers.
     *
     * This is intentionally simple for now.
     * Add debounce if your customer list becomes large.
     */
    useEffect(() => {
        if (!isBookingFormOpen) {
            return;
        }

        async function loadCustomers() {
            try {
                const params = new URLSearchParams();

                if (customerSearch.trim()) {
                    params.set(
                        "search",
                        customerSearch.trim(),
                    );
                }

                const response = await fetch(
                    `${API_URL}/api/organization/customers?${params.toString()}`,
                    {
                        headers: getAuthHeaders(),
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load customers.",
                    );
                }

                const data = await response.json();

                setCustomers(data.data ?? data);
            } catch (error) {
                console.error(error);
            }
        }

        loadCustomers();
    }, [customerSearch, isBookingFormOpen]);

    function selectCustomer(customer: Customer) {
        setSelectedCustomer(customer);

        updateBookingForm(
            "customerId",
            customer.id,
        );

        setCustomerSearch("");
        setIsCustomerSearchOpen(false);
    }

    function removeCustomer() {
        setSelectedCustomer(null);

        updateBookingForm(
            "customerId",
            "",
        );
    }

    function openCreateCustomer() {
        setCustomerForm(initialCustomerForm);
        setIsCreateCustomerOpen(true);
        setIsCustomerSearchOpen(false);
    }

    function closeCreateCustomer() {
        setIsCreateCustomerOpen(false);
    }

    async function handleCreateCustomer(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const name = customerForm.name.trim();
        const email = customerForm.email.trim();

        if (!name || !email) {
            return;
        }

        try {
            /*
             * Check whether the customer already exists.
             */
            const params = new URLSearchParams({
                name,
                email,
            });

            const existsResponse = await fetch(
                `${API_URL}/api/organization/customers/exists?${params.toString()}`,
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                },
            );

            if (!existsResponse.ok) {
                throw new Error(
                    "Failed to check whether the customer already exists.",
                );
            }

            const existsData = await existsResponse.json();

            if (existsData.exists) {
                console.error(
                    "A customer with this name and email already exists.",
                );

                return;
            }

            /*
             * Create the customer.
             */
            const response = await fetch(
                `${API_URL}/api/organization/customers`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        name,
                        email,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to create customer.",
                );
            }

            const data = await response.json();

            const customer: Customer =
                data.data ?? data;

            /*
             * Automatically select the newly-created
             * customer in the booking form.
             */
            selectCustomer(customer);

            setCustomers((current) => [
                customer,
                ...current,
            ]);

            closeCreateCustomer();
        } catch (error) {
            console.error(error);
        }
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!selectedCustomer) {
            return;
        }

        const payload = {
            customer_id: form.customerId,
            event_type_id: form.eventTypeId,
            start_at: `${form.date} ${form.startTime}:00`,
            end_at: `${form.date} ${form.endTime}:00`,
            notes: form.notes || null,
        };

        try {
            const response = await fetch(
                `${API_URL}/api/organization/bookings`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload),
                },
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to create booking.",
                );
            }

            closeBookingForm();

            /*
             * Later:
             * refresh FullCalendar events here.
             */
            console.log(
                "Booking created:",
                payload,
            );
        } catch (error) {
            console.error(error);
        }
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
                                changeView(
                                    "dayGridMonth",
                                )
                            }
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${currentView ===
                                "dayGridMonth"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:bg-white hover:text-gray-900"
                                }`}
                        >
                            {t("month")}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                changeView(
                                    "timeGridWeek",
                                )
                            }
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${currentView ===
                                "timeGridWeek"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:bg-white hover:text-gray-900"
                                }`}
                        >
                            {t("week")}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                changeView(
                                    "timeGridDay",
                                )
                            }
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${currentView ===
                                "timeGridDay"
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
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {t(
                                        "booking.title",
                                    )}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {t(
                                        "booking.subtitle",
                                    )}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeBookingForm
                                }
                                aria-label={t(
                                    "booking.close",
                                )}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-5 px-6 py-6">
                                {/* Customer */}
                                <div className="relative">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t(
                                            "booking.customer",
                                        )}
                                    </label>

                                    {selectedCustomer ? (
                                        <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {
                                                        selectedCustomer.name
                                                    }
                                                </div>

                                                <div className="text-xs text-gray-700">
                                                    {
                                                        selectedCustomer.email
                                                    }
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={
                                                    removeCustomer
                                                }
                                                className="text-sm text-gray-500 hover:text-gray-900"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                value={
                                                    customerSearch
                                                }
                                                onChange={(
                                                    event,
                                                ) => {
                                                    setCustomerSearch(
                                                        event
                                                            .target
                                                            .value,
                                                    );

                                                    setIsCustomerSearchOpen(
                                                        true,
                                                    );
                                                }}
                                                onFocus={() =>
                                                    setIsCustomerSearchOpen(
                                                        true,
                                                    )
                                                }
                                                placeholder={t(
                                                    "booking.searchCustomer",
                                                )}
                                                autoComplete="off"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                            />

                                            {isCustomerSearchOpen && (
                                                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {customers.length >
                                                            0 ? (
                                                            customers.map(
                                                                (
                                                                    customer,
                                                                ) => (
                                                                    <button
                                                                        key={
                                                                            customer.id
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            selectCustomer(
                                                                                customer,
                                                                            )
                                                                        }
                                                                        className="block w-full px-3 py-2.5 text-left transition hover:bg-gray-50"
                                                                    >
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {
                                                                                customer.name
                                                                            }
                                                                        </div>

                                                                        <div className="text-xs text-gray-700">
                                                                            {
                                                                                customer.email
                                                                            }
                                                                        </div>
                                                                    </button>
                                                                ),
                                                            )
                                                        ) : (
                                                            <div className="px-3 py-3 text-sm text-gray-500">
                                                                {t(
                                                                    "booking.noCustomersFound",
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            openCreateCustomer
                                                        }
                                                        className="w-full border-t border-gray-200 px-3 py-2.5 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
                                                    >
                                                        +{" "}
                                                        {t(
                                                            "booking.addCustomer",
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Event type */}
                                <div>
                                    <label
                                        htmlFor="eventType"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        {t(
                                            "booking.eventType",
                                        )}
                                    </label>

                                    <select
                                        id="eventType"
                                        value={
                                            form.eventTypeId
                                        }
                                        onChange={(event) =>
                                            updateBookingForm(
                                                "eventTypeId",
                                                event.target
                                                    .value,
                                            )
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    >
                                        <option value="">
                                            {t(
                                                "booking.selectEventType",
                                            )}
                                        </option>

                                        {eventTypes.map(
                                            (eventType) => (
                                                <option
                                                    key={
                                                        eventType.id
                                                    }
                                                    value={
                                                        eventType.id
                                                    }
                                                >
                                                    {
                                                        eventType.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>

                                {/* Date */}
                                <div>
                                    <label
                                        htmlFor="date"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        {t(
                                            "booking.date",
                                        )}
                                    </label>

                                    <input
                                        id="date"
                                        type="date"
                                        value={form.date}
                                        onChange={(event) =>
                                            updateBookingForm(
                                                "date",
                                                event.target
                                                    .value,
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
                                            {t(
                                                "booking.startTime",
                                            )}
                                        </label>

                                        <input
                                            id="startTime"
                                            type="time"
                                            value={
                                                form.startTime
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateBookingForm(
                                                    "startTime",
                                                    event
                                                        .target
                                                        .value,
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
                                            {t(
                                                "booking.endTime",
                                            )}
                                        </label>

                                        <input
                                            id="endTime"
                                            type="time"
                                            value={
                                                form.endTime
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateBookingForm(
                                                    "endTime",
                                                    event
                                                        .target
                                                        .value,
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
                                        {t(
                                            "booking.notes",
                                        )}
                                    </label>

                                    <textarea
                                        id="notes"
                                        rows={3}
                                        value={form.notes}
                                        onChange={(event) =>
                                            updateBookingForm(
                                                "notes",
                                                event.target
                                                    .value,
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
                                    onClick={
                                        closeBookingForm
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    {t(
                                        "booking.cancel",
                                    )}
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        !selectedCustomer ||
                                        !form.eventTypeId
                                    }
                                    className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {t(
                                        "booking.create",
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create customer modal */}
            {isCreateCustomerOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
                    onMouseDown={closeCreateCustomer}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {t(
                                        "customer.createTitle",
                                    )}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {t(
                                        "customer.createSubtitle",
                                    )}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeCreateCustomer
                                }
                                aria-label={t(
                                    "customer.close",
                                )}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleCreateCustomer
                            }
                        >
                            <div className="space-y-5 px-6 py-6">
                                <div>
                                    <label
                                        htmlFor="newCustomerName"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        {t(
                                            "customer.name",
                                        )}
                                    </label>

                                    <input
                                        id="newCustomerName"
                                        type="text"
                                        value={customerForm.name}
                                        onChange={(event) =>
                                            setCustomerForm((current) => ({
                                                ...current,
                                                name: event.target.value,
                                            }))
                                        }
                                        required
                                        autoFocus
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="newCustomerEmail"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        {t(
                                            "customer.email",
                                        )}
                                    </label>

                                    <input
                                        id="newCustomerEmail"
                                        type="email"
                                        value={customerForm.email}
                                        onChange={(event) =>
                                            setCustomerForm((current) => ({
                                                ...current,
                                                email: event.target.value,
                                            }))
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={
                                        closeCreateCustomer
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    {t(
                                        "customer.cancel",
                                    )}
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    {t(
                                        "customer.create",
                                    )}
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

    const month = String(
        date.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
        date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}