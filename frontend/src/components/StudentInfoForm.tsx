import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PastCourseItem } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { getAllDisciplines } from "@/utils/disciplineUtils";
import { uiTranslations, translateWithPlaceholders, getFarsiSemester } from "@/utils/translationUtils";

interface StudentInfoFormProps {
  discipline: string;
  setDiscipline: (value: string) => void;
  semester: string;
  setSemester: (value: string) => void;
  selectedPastCourses: string[];
  setSelectedPastCourses: (courses: string[]) => void;
}

const StudentInfoForm: React.FC<StudentInfoFormProps> = ({
  discipline,
  setDiscipline,
  semester,
  setSemester,
  selectedPastCourses,
  setSelectedPastCourses,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pastCourses, setPastCourses] = useState<PastCourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle discipline change - clear selected courses
  const handleDisciplineChange = (newDiscipline: string) => {
    setDiscipline(newDiscipline);
    setSelectedPastCourses([]);  // Clear selected past courses
  };

  // Handle semester change - clear selected courses
  const handleSemesterChange = (newSemester: string) => {
    setSemester(newSemester);
    setSelectedPastCourses([]);  // Clear selected past courses
  };

const [disciplines, setDisciplines] = useState<string[]>([]);

useEffect(() => {
  const loadDisciplines = async () => {
    try {
      const res = await fetch("/courses.json"); // مسیر فایل JSONL
      const text = await res.text();

      const lines = text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => JSON.parse(line));

      // استخراج رشته‌ها از فیلد program
      const programs = Array.from(new Set(lines.map((course: any) => course.program)));
      setDisciplines(programs);
    } catch (err) {
      console.error("Error loading disciplines:", err);
    }
  };

  loadDisciplines();
}, []);

  // Fetch past courses from JSONL file
const fetchPastCourses = async (selectedDiscipline: string, selectedSemester: string) => {
  setIsLoading(true);

  try {
    const response = await fetch("/courses.json");
    const text = await response.text();

    const allCourses = text
      .split("\n")
      .filter(line => line.trim() !== "")
      .map(line => JSON.parse(line));

    const selectedTermNumber = parseInt(selectedSemester.replace("ترم ", ""), 10);

    const pastCoursesFiltered = allCourses.filter(course => {
      let courseTermNumber: number | null = null;

      if (course.term && typeof course.term === "string" && course.term.startsWith("ترم ")) {
        courseTermNumber = parseInt(course.term.replace("ترم ", ""), 10);
      }

      const matchesDiscipline = course.program.includes(selectedDiscipline);

      // لاگ دیباگ
      console.log(
        `Course: "${course.name}" | Program: "${course.program}" | Match: ${matchesDiscipline} | Term: ${courseTermNumber}`
      );

      // فقط درس‌هایی که رشته درست دارند و ترم کوچکتر از ترم انتخابی
      return matchesDiscipline && courseTermNumber !== null && courseTermNumber < selectedTermNumber;
    });

    const formattedCourses: PastCourseItem[] = pastCoursesFiltered.map(course => ({
      value: course.id,
      label: course.name,
    }));

    setPastCourses(formattedCourses);
    setIsLoading(false);

    toast({
      title: "دروس مانده از ترم های قبل",
      description: `تعداد ${formattedCourses.length} درس تا ترم ${selectedSemester} پیدا شد.`,
    });
  } catch (error) {
    console.error("Error loading courses:", error);
    setIsLoading(false);
    toast({
      variant: "destructive",
      title: "خطای بارگیری دروس قبلی",
      description: "مشکلی در بارگیری دروس قبلی وجود داشت. لطفا دوباره امتحان کنید.",
    });
  }
};


useEffect(() => {
  if (discipline && semester) {
    fetchPastCourses(discipline, semester);
  } else {
    setPastCourses([]);
  }
}, [discipline, semester]);


  const handleSelect = (courseValue: string) => {
    setSelectedPastCourses(
      selectedPastCourses.includes(courseValue)
        ? selectedPastCourses.filter(item => item !== courseValue)
        : [...selectedPastCourses, courseValue]
    );
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow bg-[#f8f6f2]">
      <CardContent className="pt-4">
        <div>
          <h2 className="text-xl font-bold text-emerald-800 mb-3">{uiTranslations.studentInfo}</h2>
          
          <div className="flex flex-wrap gap-3 md:flex-nowrap">
            {/* Discipline Selector */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-emerald-700 mb-1">
                {uiTranslations.discipline}
              </label>
              <Select value={discipline} onValueChange={handleDisciplineChange}>
                <SelectTrigger className="w-full border-emerald-200 focus:ring-emerald-500 bg-white" dir="rtl">
                  <SelectValue placeholder={uiTranslations.selectDiscipline} />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.map((discipline) => (
                <SelectItem key={discipline} value={discipline} dir="rtl">
                  {discipline}
                </SelectItem>
              ))}
              </SelectContent>
              </Select>
            </div>
            
            {/* Semester Selector */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-emerald-700 mb-1">
                {uiTranslations.semester}
              </label>
              <Select value={semester} onValueChange={handleSemesterChange}>
                <SelectTrigger className="w-full border-emerald-200 focus:ring-emerald-500 bg-white" dir="rtl">
                  <SelectValue placeholder={uiTranslations.selectSemester} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()} dir="rtl">
                      {getFarsiSemester(num.toString())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Past Courses Multi-Select */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-emerald-700 mb-1">
                {uiTranslations.pastCourses}
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between border-emerald-200 bg-white hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uiTranslations.loadingCourses}
                      </span>
                    ) : selectedPastCourses.length > 0 ? (
                      translateWithPlaceholders("coursesSelected", { count: selectedPastCourses.length })
                    ) : (
                      uiTranslations.selectCourses
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder={uiTranslations.searchCourses} className="mr-1"/>
                    <CommandList>
                      <CommandEmpty>
                        {isLoading ? uiTranslations.loadingCourses : uiTranslations.noCourses}
                      </CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-y-auto">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                          </div>
                        ) : (
                          pastCourses.map((course) => (
                            <CommandItem
                              key={course.label}
                              value={course.label}
                              onSelect={() => {
                                handleSelect(course.value);
                              }}
                            >
                              <Check
                                className={cn(
                                  "ml-1 h-3 w-3 text-emerald-500",
                                  selectedPastCourses.includes(course.value) 
                                    ? "opacity-100" 
                                    : "opacity-0"
                                )}
                              />
                              <span>{course.label}</span>
                              {/*<span className="ml-2 text-sm text-gray-500">{course.value}</span>*/}
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Show selected courses as badges */}
          {selectedPastCourses.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedPastCourses.map((courseValue) => {
                const course = pastCourses.find(c => c.value === courseValue);
                return (
                  <Badge 
                    key={courseValue}
                    variant="outline" 
                    className="bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    <button
                      className="ml-1 text-emerald-500 hover:text-emerald-700"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelect(courseValue);
                      }}
                    >
                      ×
                    </button>
                    <span className="ml-1">{course.label}</span>
                    {/*{course && <span className="ml-1 text-xs opacity-70">({course.value})</span>}*/}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInfoForm;
