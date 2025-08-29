
import React from "react";
import { Button } from "@/components/ui/button";
import { DayOfWeek } from "@/types";
import { cn } from "@/lib/utils";
import { dayTranslations, shortDayTranslations, uiTranslations } from "@/utils/translationUtils";

interface WeekDaySelectorProps {
  selectedDays: DayOfWeek[];
  onSelectDay: (day: DayOfWeek) => void;
  activeDay: DayOfWeek | null;
  setActiveDay: (day: DayOfWeek | null) => void;
}

const WeekDaySelector: React.FC<WeekDaySelectorProps> = ({
  selectedDays,
  onSelectDay,
  activeDay,
  setActiveDay,
}) => {
  const days: DayOfWeek[] = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  // Disabled days
  const disabledDays: DayOfWeek[] = [];

  const handleDayClick = (day: DayOfWeek) => {
    // If the day is disabled, don't allow selection
    if (disabledDays.includes(day)) return;
    
    // If there's already an active day, don't allow selection of another day
    if (activeDay && day !== activeDay) return;
    
    // If the day is already in the schedule, make it active for editing
    if (selectedDays.includes(day)) {
      setActiveDay(day);
    } else {
      // If the day is not in the schedule yet, add it to selected days and make it active
      onSelectDay(day);
      setActiveDay(day);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-indigo-900">{uiTranslations.daysYouCanAttend}</h2>
      <div className="flex flex-wrap gap-2">
        {days.map((day) => {
          const isSelected = selectedDays.includes(day);
          const isDisabled = disabledDays.includes(day);
          const isActive = activeDay === day;
          
          return (
            <Button
              key={day}
              onClick={() => handleDayClick(day)}
              className={cn(
                "transition-all font-medium shadow-sm",
                isSelected 
                  ? "bg-gradient-to-l from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white" 
                  : "bg-white hover:bg-gray-100 text-gray-800 border",
                // If there's an active day and it's not this day, disable this button
                activeDay && activeDay !== day ? "opacity-50 cursor-not-allowed" : "",
                // Gray out disabled days
                isDisabled ? "bg-gray-200 text-gray-400 hover:bg-gray-200 cursor-not-allowed opacity-60" : "",
                isActive ? "ring-2 ring-indigo-500 ring-opacity-50" : ""
              )}
              disabled={(activeDay !== null && activeDay !== day) || isDisabled}
              variant="outline"
              size="sm"
            >
              {dayTranslations[day]}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekDaySelector;
