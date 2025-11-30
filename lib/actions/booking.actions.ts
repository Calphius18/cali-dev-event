"use server";

import { Booking } from "@/database";
import dbConnect from "../mongodb";

export const createBooking = async ({ eventId, slug, email } : { eventId: string; slug: string; email: string }) => {
    try {
        await dbConnect();

        await Booking.create({ eventId, slug, email })

        return { success: true };
    } catch (error) {
        console.error("Error creating booking:", error);
        return { success: false };
    }
}