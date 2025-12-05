/** Enum representing the state of a calendar event in Spanish.
 * It includes three possible states:
 * - SCHEDULED: 'cita confirmada' (confirmed appointment)
 * - PENDING: 'por confirmar' (to be confirmed)
 * - AVAILABLE: 'disponible' (available)
 * is used for categorizing calendar events based on their summary or title.
 * used for tracking state, metrics, or filtering events in a calendar application.
 */
export enum CalendarEventState {
  SCHEDULED = 'cita confirmada',
  PENDING = 'cita por confirmar',
  AVAILABLE = 'cita disponible',
}
