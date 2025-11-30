"use server";

import { Event, IEvent } from "@/database";
import dbConnect from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
  try {
    await dbConnect();
    const event = await Event.findOne({ slug });

    if (!event) {
      return [];
    }

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();

    return similarEvents as unknown as IEvent[];
  } catch (error) {
    console.error("Error fetching similar events:", error);
    return [];
  }
};