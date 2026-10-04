// A provisional clock plan, not a road-time or opening-hours lookup. Every
// transfer allowance remains explicitly unverified until a licensed routing
// source and the venue's own hours are checked by the travel desk.
const validTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : '';
const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
const clock = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;

const buildDaySchedule = ({ dayIndex, durationDays, durationNights, places = [], arrivalTime, departureTime }) => {
  const first = dayIndex === 0;
  const last = dayIndex === durationDays - 1;
  const arrival = validTime(arrivalTime);
  const departure = validTime(departureTime);
  const hasPreviousHotel = dayIndex > 0 && dayIndex <= durationNights;
  const hasHotelTonight = dayIndex < durationNights;
  const start = first ? Math.max(arrival ? minutes(arrival) + 60 : 13 * 60, 8 * 60) : 8 * 60;
  const end = last ? Math.min(departure ? minutes(departure) - 60 : 17 * 60, 20 * 60) : 18 * 60;
  const schedule = [];
  const add = (from, to, label, kind, detail = '', place = '') => {
    if (to <= from) return;
    schedule.push({ start: clock(from), end: clock(to), label, kind, detail, place });
  };
  let cursor = start;

  if (first && arrival && minutes(arrival) >= 16 * 60) {
    add(minutes(arrival), Math.min(minutes(arrival) + 30, 23 * 60 + 59), 'Late arrival and hotel transfer', 'hotel', 'No attraction is scheduled after a late arrival; confirm check-in and transfer.');
    return { schedule, placed: [], assumptions: ['Late arrival leaves no reliable sightseeing window on day 1.', 'Hotel and road transfer require staff confirmation.'] };
  }
  if (last && departure && minutes(departure) <= 9 * 60) {
    const earlyStart = Math.max(0, minutes(departure) - 90);
    add(earlyStart, Math.max(earlyStart + 20, minutes(departure) - 60), 'Early checkout and leave hotel', 'departure', 'Confirm transfer and the required airport or station check-in allowance.');
    return { schedule, placed: [], assumptions: ['Early departure leaves no reliable sightseeing window on the final day.', 'Transfer and check-in times require staff confirmation.'] };
  }

  if (first && durationDays > 1) {
    add(cursor, cursor + 45, hasHotelTonight ? 'Arrive, leave bags and settle' : 'Arrive and meet the travel desk', 'hotel',
      arrival ? `Based on your ${arrival} arrival; confirm transfer and hotel check-in time.` : 'Assumes arrival by 13:00; confirm your actual arrival and hotel check-in time.');
    cursor += 45;
  } else if (hasPreviousHotel) {
    add(cursor, cursor + 40, 'Breakfast at hotel', 'meal', 'Meal service and timing depend on the confirmed hotel plan.');
    cursor += 40;
    add(cursor, cursor + 20, last ? 'Check out and leave hotel' : 'Leave hotel', 'hotel',
      last ? 'Confirm checkout and baggage arrangements.' : 'Meet the driver or guide at the hotel entrance.');
    cursor += 20;
  } else if (first) {
    add(cursor, cursor + 20, 'Meet driver and start route', 'departure', 'Starting point and transfer need staff confirmation.');
    cursor += 20;
  }

  const limit = first && last ? 2 : first || last ? 2 : 3;
  const placed = [];
  for (const place of places.slice(0, limit)) {
    const mealDue = cursor >= 12 * 60 && cursor <= 14 * 60 && !schedule.some(item => item.kind === 'meal' && item.label === 'Lunch and rest');
    if (mealDue) {
      if (cursor + 60 > end) break;
      add(cursor, cursor + 60, 'Lunch and rest', 'meal', 'Allow time for the requested meal plan and a comfort break.');
      cursor += 60;
    }
    const transfer = placed.length ? 35 : 40;
    const visit = first ? 75 : 90;
    const finish = cursor + transfer + visit;
    // Keep an end-of-day return/departure allowance. An omitted selected stop
    // is surfaced in planningReview instead of being packed into an impossible day.
    if (finish + 45 > end) break;
    add(cursor, cursor + transfer, `Travel to ${place}`, 'transfer', 'Provisional transfer allowance; road time and distance have not been checked.', place);
    cursor += transfer;
    add(cursor, cursor + visit, `Visit ${place}`, 'visit', 'Suggested visit window and duration. Confirm official opening hours, entry or darshan slot and access.', place);
    cursor += visit;
    placed.push(place);
  }

  if (!schedule.some(item => item.label === 'Lunch and rest') && cursor >= 11 * 60 && cursor + 60 <= end && placed.length) {
    add(cursor, cursor + 60, 'Lunch and rest', 'meal', 'Meal venue and service require staff confirmation.');
    cursor += 60;
  }
  if (last) {
    if (placed.length && cursor + 45 < end) {
      add(cursor, cursor + 45, 'Return to hotel and collect luggage', 'hotel',
        'Provisional transfer allowance; confirm checkout, luggage storage and pickup with the hotel.');
      cursor += 45;
    }
    const transferStart = Math.max(cursor, end - 45);
    if (transferStart > cursor) {
      add(cursor, transferStart, placed.length ? 'Free time and prepare for departure' : 'Rest and prepare for departure', 'rest',
        'Use this interval for rest and any remaining arrangements before leaving for the departure point.');
    }
    add(Math.max(cursor, transferStart), end, 'Leave for departure point', 'departure',
      `Provisional transfer allowance; plan to reach the departure point about one hour before${departure ? ` your ${departure}` : ' departure'}. Confirm check-in time, traffic and pickup location.`);
  } else if (placed.length) {
    add(cursor, Math.min(cursor + 45, end), 'Return to hotel', 'hotel',
      'Provisional transfer allowance; staff must check the road route, traffic and pickup point.');
  } else if (!first && cursor < end) {
    add(cursor, Math.min(cursor + 60, end), 'Rest or local time near hotel', 'rest', 'No additional attraction has been added to your selected route.');
  }

  const assumptions = ['Clock times are a suggested sequence, not reservations.', 'Transfer allowances are provisional; no licensed road routing or live traffic was used.', 'Venue hours, tickets and darshan slots need official-source checks.'];
  if (first && !arrival) assumptions.push('Day 1 assumes arrival by 13:00 because no arrival time was given.');
  if (last && !departure) assumptions.push('Final day assumes departure after 17:00 because no departure time was given.');
  if (last && departure) assumptions.push(`Allows about one hour before the requested ${departure} departure; increase this for airport or station check-in.`);
  return { schedule, placed, assumptions };
};

module.exports = { buildDaySchedule, validTime };
