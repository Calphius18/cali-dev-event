import EventDetails from "@/components/EventDetails";
import { Suspense } from "react";

const EventsDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {

  const slug = params.then((p) => p.slug);

  return (
  <main>
    <Suspense fallback={<div>Loading event details...</div>}>
      <EventDetails params={slug} />
    </Suspense>
  </main>
  )
};

export default EventsDetailsPage;
