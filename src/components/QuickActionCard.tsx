// Individual quick action card with hover effects
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  delay?: number;
}

const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  delay = 0,
}: QuickActionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start p-5 rounded-2xl",
        "bg-card border border-border/50",
        "hover:border-primary/40 hover:shadow-xl hover:-translate-y-1.5",
        "transition-all duration-300 ease-out text-left w-full",
        "animate-slide-up opacity-0 overflow-hidden"
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      
      {/* Icon */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-gradient-hero rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
        <div className="relative w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-card-foreground mb-1.5 group-hover:text-primary transition-colors duration-200">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* Bottom accent line on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-hero transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </button>
  );
};

export default QuickActionCard;
