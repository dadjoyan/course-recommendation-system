
import React from "react";
import { DayOfWeek, Course } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dayTranslations } from "@/utils/translationUtils";

interface CourseTableProps {
  courses: Course[];
}

const CourseTable: React.FC<CourseTableProps> = ({ courses }) => {
  // Group courses by day
  const coursesByDay: Record<DayOfWeek, Course[]> = courses.reduce(
    (acc, course) => {
      if (!acc[course.day]) {
        acc[course.day] = [];
      }
      acc[course.day].push(course);
      return acc;
    },
    {} as Record<DayOfWeek, Course[]>
  );

  // Sort days in a logical order
  const orderedDays: DayOfWeek[] = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-emerald-700">دروس موجود بر اساس روز</h2>
      </div>
      
      <div className="rounded-md border border-emerald-200 overflow-hidden shadow-sm">
        <Table>
          <TableCaption className="m-1">دروس موجود بر اساس برنامه شما</TableCaption>
          <TableHeader className="bg-emerald-50">
            <TableRow>
              <TableHead className="font-semibold text-emerald-700 text-right">روز</TableHead>
              <TableHead className="font-semibold text-emerald-700 text-right">ساعت</TableHead>
              <TableHead className="font-semibold text-emerald-700 text-right">کد درس</TableHead>
              <TableHead className="font-semibold text-emerald-700 text-right">نام درس</TableHead>
              <TableHead className="font-semibold text-emerald-700 text-center">واحد</TableHead>
              <TableHead className="font-semibold text-emerald-700 text-right">استاد</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedDays.map((day) => {
              const dayCourses = coursesByDay[day] || [];
              
              if (dayCourses.length === 0) return null;
              
              return dayCourses.map((course, courseIndex) => (
                <TableRow 
                  key={`${day}-${course.course_code}-${courseIndex}`}
                  className={`hover:bg-emerald-50 transition-colors ${
                    courseIndex === 0 ? "border-t-2 border-t-emerald-100" : ""
                  }`}
                >
                  <TableCell className="font-medium text-emerald-800 text-right">
                    {courseIndex === 0 ? dayTranslations[day] : ""}
                  </TableCell>
                  <TableCell className="text-right">{course.timeSlot}</TableCell>
                  <TableCell className="font-medium text-emerald-800 text-right">
                    {course.course_code}
                  </TableCell>
                  <TableCell className="text-right">{course.course_name}</TableCell>
                  <TableCell className="text-center">{course.course_hours}</TableCell>
                  <TableCell className="text-right">{course.course_teacher}</TableCell>
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseTable;
