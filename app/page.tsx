import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
}

const Home = async () => {
  "use cache";
  cacheLife("hours")
  let events: IEvent[] = [];

  try {
    const res = await fetch(`${BASE_URL}/api/events`);

    if (!res.ok) {
      console.error("Failed to fetch events:", res.status, res.statusText);
    } else {
      const data: unknown = await res.json();

      if (Array.isArray((data as { events?: IEvent[] }).events)) {
        events = (data as { events?: IEvent[] }).events ?? [];
      } else {
        console.error("Unexpected events payload shape", data);
      }
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  }

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br />
        Event You Mustn't Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events list-none">
          {events.length > 0 &&
            events.map((event: IEvent) => (
              <li key={event.slug ?? event.title} className="event-card">
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default Home;
