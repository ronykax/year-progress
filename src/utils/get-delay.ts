import { DateTime } from "luxon";

export default function getDelay() {
    const now = DateTime.utc();
    const nextTriggerHour = now.hour < 12 ? 12 : 24;
    const nextTrigger = now.set({
        hour: nextTriggerHour,
        minute: 0,
        second: 0,
        millisecond: 0,
    });

    return nextTrigger.diff(now).toMillis();
}