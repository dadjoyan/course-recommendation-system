
// Translation utilities for Farsi language

// Days of week translations
export const dayTranslations: Record<string, string> = {
  "Monday": "دوشنبه",
  "Tuesday": "سه شنبه",
  "Wednesday": "چهارشنبه",
  "Thursday": "پنجشنبه",
  "Friday": "جمعه",
  "Saturday": "شنبه",
  "Sunday": "یکشنبه"
};

// Short day names (3 letters)
export const shortDayTranslations: Record<string, string> = {
  "Mon": "دوشنبه",
  "Tue": "سه شنبه",
  "Wed": "چهارشنبه",
  "Thu": "پنجشنبه",
  "Fri": "جمعه",
  "Sat": "شنبه",
  "Sun": "یکشنبه"
};

// User interface translations
export const uiTranslations = {
  // Headers & Titles
  "semesterPlanner": "برنامه ریزی هوشمند ترم",
  "studentInfo": "اطلاعات دانشجو",
  "discipline": "رشته تحصیلی",
  "selectDiscipline": "انتخاب رشته",
  "semester": "ترم",
  "selectSemester": "انتخاب ترم",
  "pastCourses": "دروس قبلی",
  "selectCourses": "انتخاب دروس",
  "daysYouCanAttend": "روز های حضور",
  "summary": "خلاصه",
  
  // Actions
  "selectAll": "انتخاب همه",
  "unselectAll": "لغو انتخاب ها",
  "cancel": "لغو",
  "confirm": "تایید",
  "clear": "پاک کردن",
  "reset": "انتخاب مجدد",
  "schedule": "برنامه ریزی هوشمند",
  
  // Dynamic content
  "selectHoursFor": "ساعاتی که در روز {day} می توانید حاضر باشد را انتخاب کنید:",
  "coursesSelected": "{count} درس انتخاب شده",
  "loadingCourses": "در حال بارگذاری دروس...",
  "searchCourses": "جستجوی دروس...",
  "noCourses": "هیچ درسی یافت نشد.",
  "semester_prefix": "ترم ",
  "resetSchedule": "انتخاب مجدد برنامه؟",
  "resetScheduleDesc": "این کار تمام روزها و ساعت‌های انتخابی شما را حذف می‌کند. این عمل قابل بازگشت نیست.",
  "coursesFetched": "دروس بارگذاری شدند",
  "foundCourses": "{count} درس برای ترم {semester} یافت شد",
  "scheduleGenerated": "برنامه ایجاد شد!",
  "scheduleGeneratedDesc": "برنامه درسی شما با موفقیت ایجاد شد.",
  "errorFetchingCourses": "خطا در بارگذاری دروس",
  "errorFetchingCoursesDesc": "مشکلی در بارگذاری دروس وجود داشت. لطفاً دوباره تلاش کنید.",
  "noDaysSelected": "هیچ روزی انتخاب نشده",
  "noDaysSelectedDesc": "لطفاً حداقل یک روز را انتخاب کنید و ساعت‌ها را تأیید کنید",
  "noDisciplineSelected": "هیچ رشته‌ای انتخاب نشده",
  "noDisciplineSelectedDesc": "لطفاً رشته خود را انتخاب کنید",
  "noSemesterSelected": "هیچ ترمی انتخاب نشده",
  "noSemesterSelectedDesc": "لطفاً ترم خود را انتخاب کنید",
  "completeStudentInfo": "لطفاً اطلاعات دانشجویی خود را تکمیل کنید",
  "courseResults": "نتایج برنامه‌ریزی",
  "courseTableCaption": "دروس موجود بر اساس برنامه شما",
  "day": "روز",
  "timeSlot": "ساعت",
  "courseCode": "کد درس",
  "courseName": "نام درس",
  "credits": "واحد",
  "teacher": "استاد",
  "planningMessage": "در حال برنامه‌ریزی ترم شما...",
  "optimizedSchedule": "ایجاد برنامه بهینه برای شما",
  "noCourseAvailable": "هیچ درسی موجود نیست",
  "availableCoursesByDay": "دروس موجود بر اساس روز"
};

// Helper function to replace placeholders in translations
export const translateWithPlaceholders = (key: string, replacements: Record<string, string | number>): string => {
  let translation = uiTranslations[key as keyof typeof uiTranslations] || key;
  
  Object.entries(replacements).forEach(([placeholder, value]) => {
    translation = translation.replace(`{${placeholder}}`, String(value));
  });
  
  return translation;
};

// Helper function to get semester in Farsi
export const getFarsiSemester = (semesterNumber: string): string => {
  return `${uiTranslations.semester_prefix}${semesterNumber}`;
};