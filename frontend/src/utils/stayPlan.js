const clean = value => typeof value === 'string' ? value.trim() : '';

export const createStayDetails = (preferences, day = {}, dayIndex = 0, durationNights = 0) => {
  if (dayIndex >= durationNights) {
    return {
      name: '',
      rating: '',
      desc: durationNights > 0
        ? 'Check out after the last planned hotel night; no overnight stay is planned for this day.'
        : 'No overnight hotel stay is planned for this route.'
    };
  }

  const category = clean(preferences.hotelCategory) || 'Preferred category';
  const area = clean(preferences.preferredHotelArea) || clean(day.base) || clean(preferences.destination);
  const preferredName = clean(preferences.preferredHotelName);
  const requestedRooms = Number(preferences.hotelRooms);
  const rooms = Number.isInteger(requestedRooms) && requestedRooms > 0
    ? `${requestedRooms} ${requestedRooms === 1 ? 'room' : 'rooms'} requested`
    : 'Room count to be confirmed';
  const location = area ? `${area} area; ` : '';
  const timing = dayIndex === 0 ? 'Check in after arrival' : 'Return after the day\'s visits';

  return {
    name: preferredName || `${category} hotel${area ? ` in ${area}` : ''}`,
    rating: preferredName ? `${category} requested` : '',
    desc: `${timing}; ${location}${rooms}. ${preferredName ? 'Traveller-preferred property' : 'Property selection'} and availability pending travel-desk confirmation.`
  };
};

export const createStaySummary = (preferences, durationNights) => {
  if (durationNights < 1) return 'No overnight hotel stay planned.';
  const category = clean(preferences.hotelCategory) || 'Preferred category';
  const area = clean(preferences.preferredHotelArea) || clean(preferences.destination);
  const preferredName = clean(preferences.preferredHotelName);
  const requestedRooms = Number(preferences.hotelRooms);
  const rooms = Number.isInteger(requestedRooms) && requestedRooms > 0
    ? `${requestedRooms} ${requestedRooms === 1 ? 'room' : 'rooms'}`
    : 'room count to be confirmed';
  const hotel = preferredName ? `${preferredName} (traveller preference)` : `${category} hotel${area ? ` in ${area}` : ''}`;
  return `${hotel}; ${category} requested; ${rooms}; ${durationNights} ${durationNights === 1 ? 'night' : 'nights'}. Property and availability pending travel-desk confirmation.`;
};
