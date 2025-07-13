import { VariantProps } from "class-variance-authority";
import { badgeVariants } from "./badge";

declare module "@/components/ui/badge" {
  export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success";
  }
} 