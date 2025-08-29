
import React, { useState } from "react";
import { DayOfWeek, TimeSlot } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import StudentInfoForm from "@/components/StudentInfoForm";
import DaySelectionPanel from "@/components/DaySelectionPanel";

interface ScheduleFormProps {
  discipline: string;
  setDiscipline: (value: string) => void;
  semester: string;
  setSemester: (value: string) => void;
  selectedPastCourses: string[];
  setSelectedPastCourses: (courses: string[]) => void;
  selectedDays: DayOfWeek[];
  setSelectedDays: (days: DayOfWeek[]) => void;
  activeDay: DayOfWeek | null;
  setActiveDay: (day: DayOfWeek | null) => void;
  dayTimeSlots: Record<DayOfWeek, TimeSlot[] | "All">;
  setDayTimeSlots: React.Dispatch<React.SetStateAction<Record<DayOfWeek, TimeSlot[] | "All">>>;
  tempTimeSlots: TimeSlot[] | "All" | null;
  setTempTimeSlots: React.Dispatch<React.SetStateAction<TimeSlot[] | "All" | null>>;
  originalTimeSlots: TimeSlot[] | "All" | null;
  setOriginalTimeSlots: React.Dispatch<React.SetStateAction<TimeSlot[] | "All" | null>>;
  isModifyingExistingDay: boolean;
  onConfirmTimeSlots: () => void;
  onCancelTimeSlots: () => void;
  onClearTimeSlots: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  discipline,
  setDiscipline,
  semester,
  setSemester,
  selectedPastCourses,
  setSelectedPastCourses,
  selectedDays,
  setSelectedDays,
  activeDay,
  setActiveDay,
  dayTimeSlots,
  setDayTimeSlots,
  tempTimeSlots,
  setTempTimeSlots,
  originalTimeSlots,
  setOriginalTimeSlots,
  isModifyingExistingDay,
  onConfirmTimeSlots,
  onCancelTimeSlots,
  onClearTimeSlots,
}) => {
  const { toast } = useToast();

  // Handle day selection/deselection
  const handleSelectDay = (day: DayOfWeek) => {
    if (!selectedDays.includes(day)) {
      // If day is not selected, add it to selectedDays
      setSelectedDays([...selectedDays, day]);
      
      // Initialize time slots for this day if not already set
      if (!dayTimeSlots[day]) {
        setDayTimeSlots({
          ...dayTimeSlots,
          [day]: [],
        });
      }
    }
    
    // Find existing day in schedule to properly set tempTimeSlots
    const existingTimeSlots = dayTimeSlots[day];
    
    if (existingTimeSlots) {
      // If day exists in schedule, use its time slots for temp state
      setOriginalTimeSlots(existingTimeSlots);
      setTempTimeSlots(existingTimeSlots);
    } else {
      // For new selections, initialize with empty array
      setOriginalTimeSlots(null);
      setTempTimeSlots([]);
    }
  };
  
  // Modified function for setting active day - this ensures time slots are initialized correctly
  const handleSetActiveDay = (day: DayOfWeek | null) => {
    if (day) {
      // Find the day in the schedule
      const existingTimeSlots = dayTimeSlots[day];
      
      if (existingTimeSlots) {
        // If the day exists in schedule, set its time slots
        setTempTimeSlots(existingTimeSlots);
        setOriginalTimeSlots(existingTimeSlots);
      } else {
        // For new selections
        setTempTimeSlots([]);
        setOriginalTimeSlots(null);
      }
    }
    
    // Set the active day
    setActiveDay(day);
  };

  // Handle time slot selection for a specific day
  const handleSelectTimeSlot = (day: DayOfWeek, slots: TimeSlot[] | "All") => {
    // Update the temporary time slots during editing
    setTempTimeSlots(slots);
  };
  
  return (
    <div className="space-y-6">
      {/* Student Info Section */}
      <StudentInfoForm 
        discipline={discipline}
        setDiscipline={setDiscipline}
        semester={semester}
        setSemester={setSemester}
        selectedPastCourses={selectedPastCourses}
        setSelectedPastCourses={setSelectedPastCourses}
      />
      
      {/* Days Selection Panel */}
      <DaySelectionPanel 
        selectedDays={selectedDays}
        onSelectDay={handleSelectDay}
        activeDay={activeDay}
        setActiveDay={handleSetActiveDay}
        tempTimeSlots={tempTimeSlots}
        onSelectTimeSlot={handleSelectTimeSlot}
        onConfirmTimeSlots={onConfirmTimeSlots}
        onCancelTimeSlots={onCancelTimeSlots}
        onClearTimeSlots={onClearTimeSlots}
        isModifyingExistingDay={isModifyingExistingDay}
      />
    </div>
  );
};

export default ScheduleForm;
