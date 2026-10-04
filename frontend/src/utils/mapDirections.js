// Maps URLs open a live Google Maps road preview. They are links, not a
// verified routing result stored by SreePayanam.
export const dayDirectionsUrl = (route, day, index, totalDays) => {
  const places = Array.isArray(day?.places) ? day.places.filter(Boolean).slice(0, 6) : [];
  if (!places.length) return '';
  const area = day.base || route.destination || '';
  const origin = index === 0 ? route.startingCity || area : area;
  const destination = index === totalDays - 1 ? route.endingCity || area : area;
  if (!origin || !destination) return '';
  const params = new URLSearchParams({ api: '1', origin, destination, travelmode: 'driving', waypoints: places.map(place => `${place}, ${route.destination || area}`).join('|') });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};
