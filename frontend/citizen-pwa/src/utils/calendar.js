/**
 * Add-to-calendar without a backend or a third-party service: build an .ics file in the
 * browser and hand it to the OS. Android, iOS, Outlook and Google Calendar all accept it.
 */

/** iCalendar wants UTC basic format: 20260814T103000Z. */
function toIcsDate(value) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** Escapes the characters iCalendar treats as structure. */
function escapeText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * A single VEVENT. Ends one hour after the start when the record has no end date — an event
 * with no duration would be dropped by some calendars.
 */
export function buildEventIcs(event) {
  const start = toIcsDate(event.startDate);
  const end = toIcsDate(event.endDate || new Date(new Date(event.startDate).getTime() + 3600000));

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Digital Gram Panchayat//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id || start}@digital-gram-panchayat`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeText(event.description)}` : null,
    event.location ? `LOCATION:${escapeText(event.location)}` : null,
    event.organizer ? `ORGANIZER;CN=${escapeText(event.organizer)}:MAILTO:noreply.invalid` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

/** Triggers the download/open of an event as a calendar entry. */
export function downloadEventIcs(event) {
  const blob = new Blob([buildEventIcs(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${String(event.title || 'event').replace(/[^\wऀ-ॿ -]/g, '')}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next tick; revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
