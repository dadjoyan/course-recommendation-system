
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import WeekDaySelector from "@/components/WeekDaySelector";
import TimeSlotSelector from "@/components/TimeSlotSelector";
import { DayOfWeek, TimeSlot } from "@/types";

interface DaySelectionPanelProps {
  selectedDays: DayOfWeek[];
  onSelectDay: (day: DayOfWeek) => void;
  activeDay: DayOfWeek | null;
  setActiveDay: (day: DayOfWeek | null) => void;
  tempTimeSlots: TimeSlot[] | "All" | null;
  onSelectTimeSlot: (day: DayOfWeek, slots: TimeSlot[] | "All") => void;
  onConfirmTimeSlots: () => void;
  onCancelTimeSlots: () => void;
  onClearTimeSlots: () => void;
  isModifyingExistingDay: boolean;
}

const DaySelectionPanel: React.FC<DaySelectionPanelProps> = ({
  selectedDays,
  onSelectDay,
  activeDay,
  setActiveDay,
  tempTimeSlots,
  onSelectTimeSlot,
  onConfirmTimeSlots,
  onCancelTimeSlots,
  onClearTimeSlots,
  isModifyingExistingDay,
}) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <WeekDaySelector
          selectedDays={selectedDays}
          onSelectDay={onSelectDay}
          activeDay={activeDay}
          setActiveDay={setActiveDay}
        />
        
        {activeDay && (
          <div className="mt-4">
            <TimeSlotSelector
              day={activeDay}
              selectedTimeSlots={tempTimeSlots || []}
              onSelectTimeSlot={onSelectTimeSlot}
              onConfirm={onConfirmTimeSlots}
              onCancel={onCancelTimeSlots}
              isModifying={isModifyingExistingDay}
              onClear={onClearTimeSlots}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DaySelectionPanel;
