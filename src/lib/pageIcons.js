import {
  LayoutDashboard,
  ListTodo,
  Target,
  Calendar,
  FileText,
  Lightbulb,
  BriefcaseBusiness,
  Users,
  Layers,
  BookOpen,
  ClipboardList,
  Rocket,
} from "lucide-react";

export const ICON_MAP = {
  "layout-dashboard": LayoutDashboard,
  "list-todo": ListTodo,
  target: Target,
  calendar: Calendar,
  "file-text": FileText,
  lightbulb: Lightbulb,
  "briefcase-business": BriefcaseBusiness,
  users: Users,
  layers: Layers,
  "book-open": BookOpen,
  "clipboard-list": ClipboardList,
  rocket: Rocket,
};

export const getIconByType = (type) => {
  switch (type) {
    case "tasks":
      return ListTodo;
    case "goals":
      return Target;
    case "calendar":
      return Calendar;
    case "notes":
      return FileText;
    case "braindump":
      return Lightbulb;
    case "empty":
      return FileText;
    default:
      return FileText;
  }
};

export const resolvePageIcon = (page) => {
  if (!page) return FileText;
  if (page.icon && ICON_MAP[page.icon]) {
    return ICON_MAP[page.icon];
  }
  return getIconByType(page.type);
};
