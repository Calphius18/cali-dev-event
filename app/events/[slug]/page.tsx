import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.action";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
}

const EventDetailsItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={24} height={24} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems?: string | string[] }) => {
  const items: string[] = Array.isArray(agendaItems)
    ? agendaItems
        .flatMap((item) => {
          if (typeof item === "string") {
            // If it looks like a JSON array string, try to parse it
            if (item.trim().startsWith("[") && item.trim().endsWith("]")) {
              try {
                const parsed = JSON.parse(item);
                if (Array.isArray(parsed)) {
                  return parsed.filter((i): i is string => typeof i === "string");
                }
              } catch (e) {
                // If parsing fails, return the string as is
                return [item];
              }
            }
            return [item];
          }
          return [];
        })
        .filter((item): item is string => typeof item === "string")
    : typeof agendaItems === "string"
      ? [agendaItems]
      : [];

  if (items.length === 0) return null;

  return (
    <div className="agenda">
      <h2>Event Agenda</h2>
      <ul>
        {items.map((item, index) => (
          <li key={item || index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const EventTags = ({ tags }: { tags?: string | string[] }) => {
  const items: string[] = Array.isArray(tags)
    ? tags
        .flatMap((tag) => {
          if (typeof tag === "string") {
            // If it looks like a JSON array string, try to parse it
            if (tag.trim().startsWith("[") && tag.trim().endsWith("]")) {
              try {
                const parsed = JSON.parse(tag);
                if (Array.isArray(parsed)) {
                  return parsed.filter((t): t is string => typeof t === "string");
                }
              } catch (e) {
                // If parsing fails, return the string as is
                return [tag];
              }
            }
            return [tag];
          }
          return [];
        })
        .filter((tag): tag is string => typeof tag === "string")
    : typeof tags === "string"
      ? [tags]
      : [];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-row gap-1.5 flex-wrap">
      {items.map((tag, index) => (
        <div className="pill" key={tag || index}>
          {tag}
        </div>
      ))}
    </div>
  );
};

const EventsDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  let request: Response;

  try {
    request = await fetch(`${BASE_URL}/api/events/${slug}`);
  } catch (error) {
    console.error("Failed to fetch event details:", error);
    return notFound();
  }

  if (!request.ok) {
    console.error("Failed to fetch event details:", request.status, request.statusText);

    if (request.status === 404) {
      return notFound();
    }

    return notFound();
  }

  let data: unknown;

  try {
    data = await request.json();
  } catch (error) {
    console.error("Failed to parse event details JSON:", error);
    return notFound();
  }

  const event = (data as { event?: any }).event;

  if (!event || !event.description) {
    return notFound();
  }

  const {
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    organizer,
    audience,
    tags,
  } = event as {
    description: string;
    image: string;
    overview: string;
    date: string;
    time: string;
    location: string;
    mode: string;
    agenda?: string | string[];
    organizer: string;
    audience: string;
    tags?: string | string[];
  };

  const bookings = 10;

  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);


  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* Left Side - Event Content */}
        <div className="content">
          <Image
            src={image}
            alt="Event Banner"
            width={700}
            height={700}
            className="banner"
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>

            <EventDetailsItem
              icon="/icons/calendar.svg"
              alt="calendar"
              label={date}
            />
            <EventDetailsItem
              icon="/icons/clock.svg"
              alt="clock"
              label={time}
            />
            <EventDetailsItem
              icon="/icons/pin.svg"
              alt="pin"
              label={location}
            />
            <EventDetailsItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailsItem
              icon="/icons/audience.svg"
              alt="audience"
              label={audience}
            />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>About The Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        {/* Right Side - Event Content */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot!
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot!</p>
            )}

            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
            <EventCard key={similarEvent.title} {...similarEvent} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsDetailsPage;
