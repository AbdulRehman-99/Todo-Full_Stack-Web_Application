declare module 'lucide-react' {
  import { FC, SVGProps } from 'react'

  interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number
    color?: string
    strokeWidth?: number
    absoluteStrokeWidth?: boolean
  }

  type Icon = FC<LucideProps>

  export const AlertCircle: Icon
  export const AlertTriangle: Icon
  export const ArrowRight: Icon
  export const Bot: Icon
  export const Check: Icon
  export const CheckCircle2: Icon
  export const CheckSquare: Icon
  export const CirclePlus: Icon
  export const ClipboardList: Icon
  export const FileText: Icon
  export const ListChecks: Icon
  export const ListTodo: Icon
  export const Loader2: Icon
  export const LogIn: Icon
  export const LogOut: Icon
  export const Mail: Icon
  export const Lock: Icon
  export const Menu: Icon
  export const MessageCircle: Icon
  export const MessageSquare: Icon
  export const Minus: Icon
  export const Eye: Icon
  export const EyeOff: Icon
  export const Pencil: Icon
  export const PlusCircle: Icon
  export const Send: Icon
  export const Sparkles: Icon
  export const Trash2: Icon
  export const Type: Icon
  export const User: Icon
  export const X: Icon
}
