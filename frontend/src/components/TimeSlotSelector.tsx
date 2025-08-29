
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DayOfWeek, TimeSlot } from "@/types";
import { cn } from "@/lib/utils";
import { X, Trash2 } from "lucide-react";
import { dayTranslations, translateWithPlaceholders, uiTranslations } from "@/utils/translationUtils";

interface TimeSlotSelectorProps {
  day: DayOfWeek;
  selectedTimeSlots: TimeSlot[] | "All";
  onSelectTimeSlot: (day: DayOfWeek, timeSlots: TimeSlot[] | "All") => void;
  onConfirm: () => void;
  onCancel: () => void;
  isModifying: boolean;
  onClear?: () => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  day,
  selectedTimeSlots,
  onSelectTimeSlot,
  onConfirm,
  onCancel,
  isModifying,
  onClear,
}) => {
  const timeSlots: TimeSlot[] = ["8-10", "10-12", "14-16", "16-18"];
  
  // Check if any time slots are selected
  const hasSelectedTimeSlots = selectedTimeSlots === "All" || 
    (Array.isArray(selectedTimeSlots) && selectedTimeSlots.length > 0);
  
  const handleTimeSlotToggle = (slot: TimeSlot) => {
    if (selectedTimeSlots === "All") {
      // If "All" is selected, switch to individual slots minus the clicked one
      const newSlots = timeSlots.filter((s) => s !== slot);
      onSelectTimeSlot(day, newSlots);
    } else {
      // Toggle individual slot
      const isSelected = selectedTimeSlots.includes(slot);
      let newSlots: TimeSlot[];
      
      if (isSelected) {
        newSlots = selectedTimeSlots.filter((s) => s !== slot);
      } else {
        newSlots = [...selectedTimeSlots, slot];
      }
      
      // If all slots are selected, change to "All"
      if (newSlots.length === timeSlots.length) {
        onSelectTimeSlot(day, "All");
      } else {
        onSelectTimeSlot(day, newSlots);
      }
    }
  };

  const handleSelectAll = () => {
    onSelectTimeSlot(day, selectedTimeSlots === "All" ? [] : "All");
  };

  return (
    <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md mt-2 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-indigo-800">
          {translateWithPlaceholders("selectHoursFor", { day: dayTranslations[day] })}
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSelectAll}
            className={selectedTimeSlots === "All" ? "bg-indigo-100 text-indigo-700" : ""}
          >
            {selectedTimeSlots === "All" ? uiTranslations.unselectAll : uiTranslations.selectAll}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {timeSlots.map((slot) => {
          const isSelected = 
            selectedTimeSlots === "All" || 
            (Array.isArray(selectedTimeSlots) && selectedTimeSlots.includes(slot));
          
          return (
            <div
              key={slot}
              className={cn(
                "flex items-center justify-center p-2 rounded-md cursor-pointer border transition-all hover:shadow-md",
                isSelected 
                  ? "bg-gradient-to-r from-green-100 to-green-200 border-green-400 shadow-inner" 
                  : "bg-white hover:bg-gray-100 border-gray-200"
              )}
              onClick={() => handleTimeSlotToggle(slot)}
            >
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={() => {}}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:text-white m-1"
                />
                <span className="text-sm font-medium">{slot}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-right gap-2 mt-4">
        <Button 
          onClick={onConfirm}
          disabled={!hasSelectedTimeSlots}
          className={cn(
            "bg-indigo-600 hover:bg-indigo-700 text-white",
            !hasSelectedTimeSlots ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          {uiTranslations.confirm}
        </Button>
        <Button 
          onClick={onCancel} 
          variant="outline" 
          className="text-gray-600"
        >
          <X className="h-4 w-4 mr-1" /> 
          {uiTranslations.cancel}
        </Button>
        {isModifying && onClear && (
          <Button 
            onClick={onClear} 
            variant="outline" 
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" /> 
            {uiTranslations.clear}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TimeSlotSelector;
