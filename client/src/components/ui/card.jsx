import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div className={cn("rounded-lg border border-gray-600 bg-black p-2 shadow-sm", className)} {...props} />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-4", className)} {...props} />;
}
