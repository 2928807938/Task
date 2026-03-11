declare module 'react-big-calendar' {
    import {ComponentType} from 'react';

    export interface Views {
    MONTH: 'month';
    WEEK: 'week';
    WORK_WEEK: 'work_week';
    DAY: 'day';
    AGENDA: 'agenda';
  }

  export interface Event {
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
  }

  export interface DateRange {
    start: Date;
    end: Date;
  }

  export interface Formats {
    dateFormat?: string;
    dayFormat?: string;
    weekdayFormat?: string;
    timeGutterFormat?: string;
    monthHeaderFormat?: string;
    dayRangeHeaderFormat?: (range: DateRange) => string;
    dayHeaderFormat?: string;
    agendaHeaderFormat?: string;
    selectRangeFormat?: string;
    agendaDateFormat?: string;
    agendaTimeFormat?: string;
    agendaTimeRangeFormat?: string;
    eventTimeRangeFormat?: string;
    eventTimeRangeStartFormat?: string;
    eventTimeRangeEndFormat?: string;
  }

  export interface Messages {
    date?: string;
    time?: string;
    event?: string;
    allDay?: string;
    week?: string;
    work_week?: string;
    day?: string;
    month?: string;
    previous?: string;
    next?: string;
    yesterday?: string;
    tomorrow?: string;
    today?: string;
    agenda?: string;
    noEventsInRange?: string;
    showMore?: (total: number) => string;
  }

  export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

  export interface CalendarProps<TEvent extends Event = Event> {
    localizer: DateLocalizer;
    events: TEvent[];
    views?: View[] | Partial<Record<keyof Views, ComponentType>>;
    view?: View;
    onView?: (view: View) => void;
    date?: Date;
    onNavigate?: (newDate: Date, view: View, action: 'PREV' | 'NEXT' | 'DATE') => void;
    length?: number;
    toolbar?: boolean;
    popup?: boolean;
    popupOffset?: number | { x: number; y: number };
    selectable?: boolean | 'ignoreEvents';
    longPressThreshold?: number;
    step?: number;
    timeslots?: number;
    rtl?: boolean;
    eventPropGetter?: (event: TEvent, start: Date, end: Date, isSelected: boolean) => { className?: string; style?: React.CSSProperties };
    slotPropGetter?: (date: Date) => { className?: string; style?: React.CSSProperties };
    dayPropGetter?: (date: Date) => { className?: string; style?: React.CSSProperties };
    showMultiDayTimes?: boolean;
    min?: Date;
    max?: Date;
    scrollToTime?: Date;
    culture?: string;
    formats?: Formats;
    components?: {
      event?: ComponentType<{ event: TEvent; title: string }>;
      eventWrapper?: ComponentType;
      dayWrapper?: ComponentType;
      dateCellWrapper?: ComponentType;
      toolbar?: ComponentType;
      agenda?: {
        date?: ComponentType;
        time?: ComponentType;
        event?: ComponentType;
      };
      day?: {
        header?: ComponentType;
        event?: ComponentType;
      };
      week?: {
        header?: ComponentType;
        event?: ComponentType;
      };
      month?: {
        header?: ComponentType;
        dateHeader?: ComponentType;
        event?: ComponentType;
      };
    };
    messages?: Messages;
    startAccessor?: ((event: TEvent) => Date) | string;
    endAccessor?: ((event: TEvent) => Date) | string;
    titleAccessor?: ((event: TEvent) => string) | string;
    allDayAccessor?: ((event: TEvent) => boolean) | string;
    resourceAccessor?: ((event: TEvent) => any) | string;
    resources?: any[];
    resourceIdAccessor?: ((resource: any) => string | number) | string;
    resourceTitleAccessor?: ((resource: any) => string) | string;
    defaultView?: View;
    defaultDate?: Date;
    getNow?: () => Date;
    onRangeChange?: (range: { start: Date; end: Date }) => void;
    onSelectEvent?: (event: TEvent, e: React.SyntheticEvent) => void;
    onDoubleClickEvent?: (event: TEvent, e: React.SyntheticEvent) => void;
    onSelectSlot?: (slotInfo: {
      start: Date;
      end: Date;
      slots: Date[];
      action: 'select' | 'click' | 'doubleClick';
    }) => void;
    onDrillDown?: (date: Date, view: View) => void;
    onShowMore?: (events: TEvent[], date: Date) => void;
    onSelecting?: (range: { start: Date; end: Date }) => boolean | undefined;
    selected?: any;
    style?: React.CSSProperties;
    className?: string;
    elementProps?: React.HTMLAttributes<HTMLElement>;
    height?: number;
    drilldownView?: View;
  }

  export class DateLocalizer {
    constructor(spec: {
      firstOfWeek: (culture?: string) => number;
      format: (value: Date, format: string, culture?: string) => string;
      formats: {
        [key: string]: string;
      };
      propType?: any;
    });
  }

  export class Calendar<TEvent extends Event = Event> extends React.Component<CalendarProps<TEvent>> {}

  export function momentLocalizer(moment: any): DateLocalizer;
  export function dateFnsLocalizer(config: any): DateLocalizer;
  export function globalizeLocalizer(globalizeInstance: any): DateLocalizer;

  export const Views: Views;
}
