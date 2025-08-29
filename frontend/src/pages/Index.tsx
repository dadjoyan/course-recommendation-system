import React, { useState } from "react";
import { DayOfWeek, TimeSlot, Schedule, ScheduleItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ScheduleForm from "@/components/ScheduleForm";
import ScheduleSummary from "@/components/ScheduleSummary";
import CourseResultDialog from "@/components/CourseResultDialog";
import { uiTranslations, dayTranslations } from "@/utils/translationUtils";
import { handleScheduleRequest } from "@/utils/apiUtils";

const Index: React.FC = () => {
  const { toast } = useToast();
  
  // Student Info States
  const [discipline, setDiscipline] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [selectedPastCourses, setSelectedPastCourses] = useState<string[]>([]);
  
  // Schedule States
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [activeDay, setActiveDay] = useState<DayOfWeek | null>(null);
  const [dayTimeSlots, setDayTimeSlots] = useState<Record<DayOfWeek, TimeSlot[] | "All">>({});
  const [tempTimeSlots, setTempTimeSlots] = useState<TimeSlot[] | "All" | null>(null);
  const [originalTimeSlots, setOriginalTimeSlots] = useState<TimeSlot[] | "All" | null>(null);
  const [schedule, setSchedule] = useState<Schedule>([]);
  
  // Results States
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Check if all student info fields are filled
  const isStudentInfoComplete = discipline !== "" && semester !== "";
  
  // Check if the active day is already in the schedule (for modification mode)
  const isModifyingExistingDay = activeDay ? schedule.some(item => item.day === activeDay) : false;

  // Handle confirming time slots for the active day
  const handleConfirmTimeSlots = () => {
    if (activeDay && tempTimeSlots !== null) {
      setDayTimeSlots({
        ...dayTimeSlots,
        [activeDay]: tempTimeSlots,
      });
      
      const existingItemIndex = schedule.findIndex(item => item.day === activeDay);
      const newItem: ScheduleItem = {
        day: activeDay,
        timeSlots: tempTimeSlots,
      };
      
      if (existingItemIndex >= 0) {
        const newSchedule = [...schedule];
        newSchedule[existingItemIndex] = newItem;
        setSchedule(newSchedule);
      } else {
        setSchedule([...schedule, newItem]);
      }
      
      setActiveDay(null);
      setOriginalTimeSlots(null);
      setTempTimeSlots(null);
      
      toast({
        title: uiTranslations.confirm,
        description: `ساعات حضور برای ${dayTranslations[activeDay]} افزوده شد.`,
      });
    }
  };

  // Handle canceling time slot selection
  const handleCancelTimeSlots = () => {
    if (activeDay) {
      if (!isModifyingExistingDay) {
        setSelectedDays(selectedDays.filter(day => day !== activeDay));
      }
      setActiveDay(null);
      setTempTimeSlots(null);
      setOriginalTimeSlots(null);
    }
  };

  // Handle clearing time slots for the active day
  const handleClearTimeSlots = () => {
    if (activeDay) {
      setDayTimeSlots({
        ...dayTimeSlots,
        [activeDay]: [],
      });
      
      setSchedule(schedule.filter(item => item.day !== activeDay));
      setSelectedDays(selectedDays.filter(day => day !== activeDay));
      setActiveDay(null);
      setTempTimeSlots(null);
      setOriginalTimeSlots(null);
      
      toast({
        title: uiTranslations.clear,
        description: `ساعات ${dayTranslations[activeDay]} پاک شد.`,
      });
    }
  };

  // Handle resetting the entire schedule
  const handleResetSchedule = () => {
    setSelectedDays([]);
    setDayTimeSlots({});
    setSchedule([]);
    setActiveDay(null);
    setTempTimeSlots(null);
    setOriginalTimeSlots(null);
    setApiResponse(null);
    setIsDialogOpen(false);
    
    toast({
      title: uiTranslations.reset,
      description: uiTranslations.resetScheduleDesc,
    });
  };

  // Handle schedule submission
  const handleSchedule = async () => {
    if (!isStudentInfoComplete) {
      toast({
        title: uiTranslations.noDisciplineSelected,
        description: uiTranslations.noDisciplineSelectedDesc,
        variant: "destructive",
      });
      return;
    }

    if (schedule.length === 0) {
      toast({
        title: uiTranslations.noDaysSelected,
        description: uiTranslations.noDaysSelectedDesc,
        variant: "destructive",
      });
      return;
    }

    if (selectedPastCourses.length === 0) {
      toast({
        title: "هشدار",
        description: "هیچ درس گذشته‌ای انتخاب نشده است. آیا ادامه می‌دهید؟",
        variant: "default",
      });
    }

    setIsLoading(true);
    setIsDialogOpen(true);

    try {
      const pastCoursesResponse = await fetch('/courses.json');
      if (!pastCoursesResponse.ok) {
        throw new Error(`Failed to fetch courses.json: ${pastCoursesResponse.status}`);
      }
      const pastCoursesText = await pastCoursesResponse.text();
      console.log("Raw courses.json content:", pastCoursesText);

      const pastCourses = pastCoursesText
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            console.error("Error parsing JSONL line:", line, e);
            return null;
          }
        })
        .filter(course => course !== null)
        .map(course => ({
          value: course.id || course.name,
          label: course.name,
        }));
      console.log("Parsed pastCourses:", pastCourses);

      if (pastCourses.length === 0) {
        throw new Error("No valid courses found in courses.json");
      }

      const result = await handleScheduleRequest(
        discipline,
        semester,
        pastCourses,
        selectedPastCourses,
        dayTimeSlots
      );
      console.log("API result:", result);

      setIsLoading(false);

      if (result) {
        setApiResponse(result);
        toast({
          title: "برنامه‌ریزی موفق",
          description: "برنامه درسی شما با موفقیت ایجاد شد.",
        });
      } else {
        setApiResponse(null);
        toast({
          title: "خطا در دریافت پاسخ",
          description: "هیچ پاسخی از سرور دریافت نشد.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error in handleSchedule:", error);
      setIsLoading(false);
      setApiResponse(null);
      if (error.message.includes("Failed to fetch") || error.message.includes("Load failed")) {
        toast({
          title: "خطای CORS یا سرور",
          description: "ارتباط با سرور برقرار نشد. لطفاً مطمئن شوید سرور فعال است و CORS درست تنظیم شده است.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطا در بارگذاری داده‌ها",
          description: `مشکلی در بارگذاری دروس یا ارتباط با سرور: ${error.message || 'خطای ناشناخته'}`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2] p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-200">
          <h1 className="text-2xl font-bold text-emerald-800">{uiTranslations.semesterPlanner}</h1>
        </div>
        
        <div className="space-y-8">
          <ScheduleForm 
            discipline={discipline}
            setDiscipline={setDiscipline}
            semester={semester}
            setSemester={setSemester}
            selectedPastCourses={selectedPastCourses}
            setSelectedPastCourses={setSelectedPastCourses}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            dayTimeSlots={dayTimeSlots}
            setDayTimeSlots={setDayTimeSlots}
            tempTimeSlots={tempTimeSlots}
            setTempTimeSlots={setTempTimeSlots}
            originalTimeSlots={originalTimeSlots}
            setOriginalTimeSlots={setOriginalTimeSlots}
            isModifyingExistingDay={isModifyingExistingDay}
            onConfirmTimeSlots={handleConfirmTimeSlots}
            onCancelTimeSlots={handleCancelTimeSlots}
            onClearTimeSlots={handleClearTimeSlots}
          />
          
          {schedule.length > 0 && (
            <Card className="shadow-sm bg-white border-emerald-200">
              <CardContent className="pt-6">
                <ScheduleSummary 
                  schedule={schedule} 
                  onSchedule={handleSchedule}
                  onReset={handleResetSchedule}
                  isStudentInfoComplete={isStudentInfoComplete}
                >
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50 m-1"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> 
                        {uiTranslations.reset}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-right">{uiTranslations.resetSchedule}</AlertDialogTitle>
                        <AlertDialogDescription className="text-right">
                          {uiTranslations.resetScheduleDesc}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="!flex !justify-start gap-x-2">
                        <AlertDialogCancel className="m-1">{uiTranslations.cancel}</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleResetSchedule}
                          className="bg-red-500 hover:bg-red-600 m-auto"
                        >
                          {uiTranslations.reset}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </ScheduleSummary>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CourseResultDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        apiResponse={apiResponse}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Index;