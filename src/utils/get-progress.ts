import { DateTime } from "luxon";
import type { Progress } from "../types";

export default function getProgress(): Progress {
    const now = DateTime.utc();
    const startOfYear = DateTime.utc(now.year, 1, 1);
    const endOfYear = DateTime.utc(now.year + 1, 1, 1);

    const yearProgress = Number(
        (
            (now.diff(startOfYear).milliseconds /
                endOfYear.diff(startOfYear).milliseconds) *
            100
        ).toFixed(2)
    );

    const dayOfYear = now.ordinal;
    const totalDays = endOfYear.diff(startOfYear, "days").days;

    const currentWeek = now.weekNumber;
    const totalWeeks = DateTime.utc(now.year, 12, 31).weekNumber;

    const currentMonth = now.month;

    return {
        year: yearProgress,
        day: {
            current: dayOfYear,
            total: totalDays,
        },
        week: {
            current: currentWeek,
            total: totalWeeks,
        },
        month: currentMonth,
        currentYear: startOfYear.year,
    };
}
