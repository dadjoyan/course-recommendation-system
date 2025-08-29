
export type DayOfWeek = 
  | "Monday" 
  | "Tuesday" 
  | "Wednesday" 
  | "Thursday" 
  | "Friday" 
  | "Saturday" 
  | "Sunday";

export type TimeSlot = "8-10" | "10-12" | "14-16" | "16-18";

export type ScheduleItem = {
  day: DayOfWeek;
  timeSlots: TimeSlot[] | "All";
};

export type Schedule = ScheduleItem[];

export type Course = {
  course_code: string;
  course_name: string;
  course_hours: number; // This will represent credits now
  course_teacher: string;
  day: DayOfWeek;
  timeSlot: TimeSlot;
};

// New type for past courses data from API
export type PastCoursesResponse = {
  [key: string]: string;
};

// New type for past course items in dropdown
export type PastCourseItem = {
  value: string;
  label: string;
};

// New type for discipline data
export interface Discipline {
  value: string;
  label: string;
}
