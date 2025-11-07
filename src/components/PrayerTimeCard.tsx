"use client";

import { useState } from "react";
import { Clock, Check } from "lucide-react";
import { capitalize, to12Hour } from "@/lib/prayer-utils";
import { PrayerName } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PrayerTimeCardProps {
  prayerName: PrayerName;
  time: string;
  iqamaTime?: string;
  isNext?: boolean;
  editable?: boolean;
  onTimeChange?: (newTime: string) => void;
}

export function PrayerTimeCard({ 
  prayerName, 
  time,
  iqamaTime,
  isNext = false,
  editable = false,
  onTimeChange 
}: PrayerTimeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTime, setEditedTime] = useState(time);

  const handleSave = () => {
    if (onTimeChange && editedTime !== time) {
      onTimeChange(editedTime);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border p-4 transition-colors",
        isNext && "border-primary bg-primary/5 shadow-sm"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isNext ? "bg-primary text-primary-foreground" : "bg-accent"
          )}
        >
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">{capitalize(prayerName)}</h3>
          {isNext && (
            <p className="text-xs text-muted-foreground">Next prayer</p>
          )}
        </div>
      </div>

      {isEditing && editable ? (
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={editedTime}
            onChange={(e) => setEditedTime(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          />
          <button
            onClick={handleSave}
            className="rounded-full bg-primary p-1 text-primary-foreground hover:bg-primary/90"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "text-right",
            editable && "cursor-pointer"
          )}
          onClick={() => editable && setIsEditing(true)}
        >
          <div>
            <p className="text-xs text-muted-foreground mb-1">Adhan</p>
            <p className={cn(
              "text-xl font-bold",
              isNext && "text-primary"
            )}>
              {to12Hour(time)}
            </p>
            <p className="text-xs text-muted-foreground">{time}</p>
          </div>
          {iqamaTime && iqamaTime !== time && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Iqama</p>
              <p className="text-lg font-semibold text-primary">
                {to12Hour(iqamaTime)}
              </p>
              <p className="text-xs text-muted-foreground">{iqamaTime}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
