import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Course {
  id: string;
  name: string;
  units_number: number;
  type: string;
  prerequisites: string[];
  corequisites: string[];
  time: string | string[];
}

interface CourseResultDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  apiResponse: Course[] | null;
  isLoading: boolean;
}

const CourseResultDialog: React.FC<CourseResultDialogProps> = ({
  isOpen,
  onOpenChange,
  apiResponse,
  isLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-right">نتایج برنامه‌ریزی</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : apiResponse && apiResponse.length > 0 ? (
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام درس</TableHead>
                  <TableHead className="text-right">تعداد واحد</TableHead>
                  <TableHead className="text-right">نوع</TableHead>
                  <TableHead className="text-right">پیش‌نیازها</TableHead>
                  <TableHead className="text-right">هم‌نیازها</TableHead>
                  <TableHead className="text-right">زمان‌ها</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiResponse.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-right">{course.name}</TableCell>
                    <TableCell className="text-right">{course.units_number}</TableCell>
                    <TableCell className="text-right">{course.type}</TableCell>
                    <TableCell className="text-right">
                      {course.prerequisites.length > 0 ? course.prerequisites.join("، ") : "ندارد"}
                    </TableCell>
                    <TableCell className="text-right">
                      {course.corequisites.length > 0 ? course.corequisites.join("، ") : "ندارد"}
                    </TableCell>
                    <TableCell className="text-right">
                      {Array.isArray(course.time) ? (
                        <ul className="list-disc pr-4">
                          {course.time.map((time, i) => (
                            <li key={i} className="text-right">{time}</li>
                          ))}
                        </ul>
                      ) : (
                        course.time || "نامشخص"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-right">هیچ درسی برای زمان‌های انتخاب‌شده یافت نشد.</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CourseResultDialog;