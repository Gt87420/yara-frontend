// Web-compatible icon components using Lucide React
"use client"

import {
  Leaf,
  Camera,
  Images,
  MapPin,
  Sprout,
  Baseline as Timeline,
  Calendar,
  TrendingUp,
  Save,
  Cross as Grass,
  Edit3,
  X,
  Package,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplets,
  Zap,
  Shield,
  MoreVertical,
  Eye,
  Trash2,
  BarChart3,
  TrendingDown,
} from "lucide-react-native"

export const Ionicons = ({ name, size = 24, color = "#000", ...props }: any) => {
  const iconProps = { size, color, ...props }

  switch (name) {
    case "leaf":
      return <Leaf {...iconProps} />
    case "camera":
      return <Camera {...iconProps} />
    case "images":
      return <Images {...iconProps} />
    case "location":
      return <MapPin {...iconProps} />
    case "calendar":
    case "calendar-outline":
      return <Calendar {...iconProps} />
    case "close-circle":
      return <X {...iconProps} />
    default:
      return <Leaf {...iconProps} />
  }
}

export const MaterialIcons = ({ name, size = 24, color = "#000", ...props }: any) => {
  const iconProps = { size, color, ...props }

  switch (name) {
    case "agriculture":
    case "eco":
      return <Sprout {...iconProps} />
    case "timeline":
      return <Timeline {...iconProps} />
    case "trending-up":
      return <TrendingUp {...iconProps} />
    case "save":
      return <Save {...iconProps} />
    case "grass":
      return <Grass {...iconProps} />
    case "inventory":
    case "package":
      return <Package {...iconProps} />
    case "search":
      return <Search {...iconProps} />
    case "filter-list":
      return <Filter {...iconProps} />
    case "add":
      return <Plus {...iconProps} />
    case "warning":
      return <AlertTriangle {...iconProps} />
    case "check-circle":
      return <CheckCircle {...iconProps} />
    case "schedule":
      return <Clock {...iconProps} />
    case "water-drop":
      return <Droplets {...iconProps} />
    case "flash-on":
      return <Zap {...iconProps} />
    case "security":
      return <Shield {...iconProps} />
    case "more-vert":
      return <MoreVertical {...iconProps} />
    case "visibility":
      return <Eye {...iconProps} />
    case "delete":
      return <Trash2 {...iconProps} />
    case "bar-chart":
      return <BarChart3 {...iconProps} />
    case "trending-down":
      return <TrendingDown {...iconProps} />
    default:
      return <Sprout {...iconProps} />
  }
}

export const Feather = ({ name, size = 24, color = "#000", ...props }: any) => {
  const iconProps = { size, color, ...props }

  switch (name) {
    case "edit-3":
      return <Edit3 {...iconProps} />
    default:
      return <Edit3 {...iconProps} />
  }
}
export { BarChart3, TrendingUp, Package, Search, Plus, AlertTriangle, CheckCircle }

