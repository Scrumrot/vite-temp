import type { NavConfig } from "@/components/Nav";
import {
  RocketLaunch,
  PlayArrow,
  Search,
  Add,
  List,
  PieChart,
  BarChart,
  TrendingUp,
  Insights,
  Widgets,
  ColorLens,
  Build,
  Help,
} from "@mui/icons-material";

export const navConfig: NavConfig = {
  items: [
    {
      id: "execution",
      label: "Execution",
      icon: <RocketLaunch />,
      items: [
        {
          id: "mc",
          label: "MC",
          icon: <RocketLaunch />,
          to: "/",
        },
        {
          id: "active-operations",
          label: "Active Operations",
          icon: <PlayArrow />,
          to: "/",
        },
      ],
    },
    {
      id: "planning",
      label: "Planning",
      icon: <Search />,
      iconBgColor: "primary.light",
      items: [
        {
          id: "c",
          label: "cc",
          icon: <Search />,
          iconBgColor: "primary.light",
          items: [
            {
              id: "find-channels",
              label: "Search",
              icon: <Search />,
              iconBgColor: "info.main",
              to: "/",
            },
            {
              id: "new-item",
              label: "Create",
              icon: <Add />,
              iconBgColor: "success.main",
              to: "/",
            },
          ],
        },
      ],
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: undefined,
      items: [
        {
          id: "my-tasks",
          label: "My Tasks",
          icon: <List />,
          iconBgColor: "primary.dark",
          items: [
            {
              id: "task-search",
              label: "Search",
              icon: <Search />,
              iconBgColor: "info.main",
              to: "/tasks",
            },
            {
              id: "create-task",
              label: "Create",
              icon: <Add />,
              iconBgColor: "success.main",
              to: "/tasks/create",
            },
          ],
        },
      ],
    },
    {
      id: "analytics",
      label: "Analytics",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <BarChart />,
          to: "/analytics",
        },
        {
          id: "trends",
          label: "Trends",
          icon: <TrendingUp />,
          to: "/analytics",
        },
        {
          id: "reports",
          label: "Reports",
          icon: <PieChart />,
          to: "/analytics",
        },
        {
          id: "insights",
          label: "Insights",
          icon: <Insights />,
          to: "/analytics",
        },
      ],
    },
    {
      id: "resources",
      label: "Resources",
      items: [
        { id: "ui", label: "UI Components", icon: <Widgets />, to: "/dev/ui" },
        { id: "color-palette", label: "Color Palette", icon: <ColorLens />, to: "/dev/colors" },
        { id: "form-builder", label: "Form Builder", icon: <Build />, to: "/dev/form-builder" },
        { id: "nav-builder", label: "Nav Config Builder", icon: <Help />, to: "/dev/nav-builder" },
      ],
    },
  ],
};
