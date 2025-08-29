
import React from "react";
import { Schedule } from "@/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import { dayTranslations, uiTranslations } from "@/utils/translationUtils";

interface ScheduleSummaryProps {
  schedule: Schedule;
  onSchedule: () => void;
  onReset?: () => void;
  children?: React.ReactNode;
  isStudentInfoComplete: boolean;
}

const ScheduleSummary: React.FC<ScheduleSummaryProps> = ({ 
  schedule, 
  onSchedule,
  onReset,
  children,
  isStudentInfoComplete 
}) => {
  if (schedule.length === 0) {
    return null;
  }

  const formatTimeSlots = (timeSlots: string[] | "All") => {
    if (timeSlots === "All") return "تمام روز";
    
    // Optimize display by combining consecutive slots
    if (Array.isArray(timeSlots)) {
      // Sort time slots for easier processing
      const sortedSlots = [...timeSlots].sort((a, b) => {
        const aStart = parseInt(a.split('-')[0]);
        const bStart = parseInt(b.split('-')[0]);
        return aStart - bStart;
      });
      
      // Find consecutive slots and combine them
      const combinedSlots = [];
      let currentStart = "";
      let currentEnd = "";
      
      sortedSlots.forEach((slot, index) => {
        const [start, end] = slot.split('-');
        
        if (index === 0) {
          currentStart = start;
          currentEnd = end;
        } else {
          // If this slot starts where the previous one ended
          if (start === currentEnd) {
            // Extend the current range
            currentEnd = end;
          } else {
            // Add the previous range and start a new one
            combinedSlots.push(`${currentStart}-${currentEnd}`);
            currentStart = start;
            currentEnd = end;
          }
        }
        
        // Add the last range if we're at the end
        if (index === sortedSlots.length - 1) {
          combinedSlots.push(`${currentStart}-${currentEnd}`);
        }
      });
      
      return combinedSlots.join(", ");
    }
    
    return "";
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-900">
          <CheckCircle className="h-5 w-5 text-green-500" />
          {uiTranslations.summary}
        </h2>
        {children}
      </div>
      
      <div className="mt-4 space-y-3 bg-gradient-to-br from-white to-indigo-50 p-4 rounded-lg shadow-sm">
        {schedule.map((item) => (
          <div 
            key={item.day} 
            className="flex flex-col sm:flex-row sm:items-center py-3 border-b last:border-0 hover:bg-white rounded transition-all"
          >
            <div className="font-medium w-24 text-indigo-800">{dayTranslations[item.day]}</div>
            <div className="flex items-center text-indigo-600 mt-1 sm:mt-0">
              <Clock className="h-4 w-4 m-1" />
              <span>{formatTimeSlots(item.timeSlots)}</span>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        onClick={onSchedule} 
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
        size="lg"
        disabled={!isStudentInfoComplete}
        title={!isStudentInfoComplete ? uiTranslations.completeStudentInfo : ""}
      >
        {uiTranslations.schedule}
      </Button>
    </div>
  );
};

export default ScheduleSummary;
