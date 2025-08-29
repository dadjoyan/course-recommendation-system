// src/utils/apiUtils.ts

import { DayOfWeek, TimeSlot } from "@/types";

const ALL_TIME_SLOTS: TimeSlot[] = ["8-10", "10-12", "14-16", "16-18"];

const DAY_TRANSLATIONS: Record<DayOfWeek, string> = {
  Saturday: "شنبه",
  Sunday: "یکشنبه",
  Monday: "دوشنبه",
  Tuesday: "سه‌شنبه",
  Wednesday: "چهارشنبه",
  Thursday: "پنجشنبه",
  Friday: "جمعه",
};

const formatTimeSlotForAPI = (slot: TimeSlot): string => {
  const [start, end] = slot.split('-');
  const formattedStart = start.padStart(2, '0') + ":00";
  const formattedEnd = end.padStart(2, '0') + ":00";
  return `${formattedStart}-${formattedEnd}`;
};

export const handleScheduleRequest = async (
  program: string,
  term: string,
  pastCourses: { value: string; label: string }[],
  selectedPastCourseIds: string[],
  dayTimeSlots: Record<DayOfWeek, TimeSlot[] | "All">
) => {
  // مرحله ۱: تبدیل ID دروس به نام‌ها
  const selectedCourseNames = selectedPastCourseIds
    .map(id => {
      const course = pastCourses.find(c => c.value === id);
      return course ? course.label : "";
    })
    .filter(name => name !== "");
  console.log("Selected course names:", selectedCourseNames);

  // مرحله ۲: تبدیل آبجکت زمان‌ها
  const timePayload: Record<string, string[]> = {};
  for (const [day, slots] of Object.entries(dayTimeSlots)) {
    const persianDay = DAY_TRANSLATIONS[day as DayOfWeek];
    if (persianDay && slots) {
      let finalSlots: string[] = slots === "All"
        ? ALL_TIME_SLOTS.map(formatTimeSlotForAPI)
        : slots.map(formatTimeSlotForAPI);
      if (finalSlots.length > 0) {
        timePayload[persianDay] = finalSlots;
      }
    }
  }
  console.log("Time payload:", timePayload);

  // مرحله ۳: ساخت JSON نهایی
  const apiPayload = {
    program: program,
    term: parseInt(term.replace("ترم ", ""), 10),
    course: selectedCourseNames,
    time: timePayload,
  };
  console.log("Sending JSON to API:", JSON.stringify(apiPayload, null, 2));

  // مرحله ۴: ارسال درخواست
  try {
    const response = await fetch('http://localhost:8000/get_courses', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.message || `خطای سرور: ${response.status}`);
    }

    const result = await response.json();
    console.log('API Success:', result);
    return result;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw error;
  }
};