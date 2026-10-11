import { eq, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { events } from "../db/schema.js";

export async function getTodaysEventService(day: number, month: number) {
    const event = await db.select().from(events).where(and(
        eq(events.day, day),
        eq(events.month, month)
    ))

    return event
}