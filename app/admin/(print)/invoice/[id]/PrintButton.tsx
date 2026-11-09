"use client";
import { Printer } from "lucide-react";
export default function PrintButton() {
  return <button onClick={() => window.print()} className="a-btn"><Printer className="size-4" /> Print / Save as PDF</button>;
}
