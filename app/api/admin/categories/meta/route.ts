import { NextResponse } from "next/server";

const iconOptions = [
  "BookOpen", "Users", "FileText", "Laptop", "Library", "Building", "Heart", 
  "Briefcase", "DollarSign", "Home", "Car", "PartyPopper", "UserCheck", 
  "Microscope", "Globe2", "GraduationCap", "Phone", "Calendar", "Mail", 
  "Clock", "MapPin", "ExternalLink", "Search", "Settings", "Shield", "Star"
];

const colorOptions = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", 
  "#84cc16", "#f97316", "#ec4899", "#6b7280", "#1f2937", "#059669"
];

export async function GET() {
  return NextResponse.json({ iconOptions, colorOptions });
}