/**
 * Export utilities for generating CSV files and triggering downloads
 */

/**
 * Escapes a value for CSV format
 * - Wraps in quotes if contains comma, quote, or newline
 * - Escapes quotes by doubling them
 */
export function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // Check if we need to escape
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generates a CSV string from headers and rows
 */
export function generateCSV(headers: string[], rows: Record<string, unknown>[]): string {
  // Create header row
  const headerRow = headers.map(escapeCSVValue).join(',');

  // Create data rows
  const dataRows = rows.map(row =>
    headers.map(header => escapeCSVValue(row[header])).join(',')
  ).join('\n');

  return `${headerRow}\n${dataRows}`;
}

/**
 * Formats a date for export (YYYY-MM-DD format)
 */
export function formatDateForExport(date: Date | string | null | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  return d.toISOString().split('T')[0];
}

/**
 * Formats a datetime for export (YYYY-MM-DD HH:mm format)
 */
export function formatDateTimeForExport(date: Date | string | null | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  return d.toISOString().replace('T', ' ').slice(0, 16);
}

/**
 * Triggers a file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads data as a CSV file
 */
export function downloadCSV(headers: string[], rows: Record<string, unknown>[], filename: string): void {
  const csv = generateCSV(headers, rows);
  downloadFile(csv, filename.endsWith('.csv') ? filename : `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Gets a timestamp string for filenames (YYYYMMDD_HHmmss)
 */
export function getExportTimestamp(): string {
  const now = new Date();
  return now.toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '_')
    .slice(0, 15);
}

// ============================================
// iCal (RFC 5545) Export Utilities
// ============================================

export interface ICalEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  startDate: Date | string;
  endDate: Date | string;
  allDay?: boolean;
}

/**
 * Formats a date to iCal format (YYYYMMDDTHHMMSSZ for UTC)
 */
function formatICalDate(date: Date | string, allDay?: boolean): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '';
  }

  if (allDay) {
    // All-day events use VALUE=DATE format: YYYYMMDD
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  }

  // Regular events use UTC format: YYYYMMDDTHHMMSSZ
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escapes text for iCal format (RFC 5545)
 * - Escapes backslashes, semicolons, commas, and newlines
 */
function escapeICalText(text: string | null | undefined): string {
  if (!text) return '';

  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Folds long lines per RFC 5545 (max 75 octets per line)
 */
function foldICalLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) {
    return line;
  }

  const lines: string[] = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    lines.push(remaining.slice(0, maxLength));
    remaining = ' ' + remaining.slice(maxLength); // Continuation lines start with space
  }

  if (remaining) {
    lines.push(remaining);
  }

  return lines.join('\r\n');
}

/**
 * Generates an iCal VEVENT block
 */
function generateICalEvent(event: ICalEvent): string {
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatICalDate(new Date())}`,
  ];

  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatICalDate(event.startDate, true)}`);
    lines.push(`DTEND;VALUE=DATE:${formatICalDate(event.endDate, true)}`);
  } else {
    lines.push(`DTSTART:${formatICalDate(event.startDate)}`);
    lines.push(`DTEND:${formatICalDate(event.endDate)}`);
  }

  lines.push(`SUMMARY:${escapeICalText(event.summary)}`);

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICalText(event.location)}`);
  }

  lines.push('END:VEVENT');

  return lines.map(foldICalLine).join('\r\n');
}

/**
 * Generates a complete iCal calendar file
 */
export function generateICal(events: ICalEvent[], calendarName?: string): string {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NICEHR//Schedule Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    calendarName ? `X-WR-CALNAME:${escapeICalText(calendarName)}` : null,
  ].filter(Boolean).join('\r\n');

  const eventBlocks = events.map(generateICalEvent).join('\r\n');

  const footer = 'END:VCALENDAR';

  return `${header}\r\n${eventBlocks}\r\n${footer}`;
}

/**
 * Downloads data as an iCal (.ics) file
 */
export function downloadICal(events: ICalEvent[], filename: string, calendarName?: string): void {
  const ical = generateICal(events, calendarName);
  downloadFile(
    ical,
    filename.endsWith('.ics') ? filename : `${filename}.ics`,
    'text/calendar;charset=utf-8'
  );
}
