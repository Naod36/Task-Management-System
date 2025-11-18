import { useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationSectionProps {
  notifications: Notification[];
  markAsRead?: (id: number) => void;
  markAllAsRead: () => void;
}

export default function NotificationSection({
  notifications,
  markAsRead,
  markAllAsRead,
}: NotificationSectionProps) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-neutral-700/40 rounded-xl shadow-md max-h-[500px] overflow-y-auto">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Notifications</h3>
        {notifications.some((n) => !n.read) && (
          <button
            className="text-sm p-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition"
            onClick={markAllAsRead}
          >
            <CheckCheck size={18} />
          </button>
        )}
      </div>
      <hr className="border-neutral-600 my-4" />

      {notifications.length === 0 && (
        <p className="text-neutral-400 text-sm">No notifications</p>
      )}
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-4 py-2 rounded-xl shadow flex justify-between items-center ${
            n.read ? "bg-neutral-800" : "bg-neutral-200 text-neutral-800"
          }`}
        >
          <p className="text-sm">{n.message}</p>
          {markAsRead && !n.read && (
            <button
              className="text-xs px-2 py-1 bg-neutral-800 text-neutral-200  flex flex-row gap-2 items-center rounded hover:scale-110 transition-all"
              onClick={() => markAsRead(n.id)}
            >
              Mark Read <Check size={18} />
            </button>
          )}
        </div>
      ))}
      <div className="flex flex-col bg-neutral-700/0   h-[60px] overflow-y-auto"></div>
    </div>
  );
}
