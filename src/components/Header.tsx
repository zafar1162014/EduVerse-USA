// Header component with logo, theme toggle, and user menu
import { GraduationCap, Sparkles, Moon, Sun, LogIn, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return "U";
    const name = user.user_metadata.full_name as string;
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="relative bg-gradient-hero text-primary-foreground py-4 px-4 md:py-5 md:px-6 shadow-xl overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50" />

      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />

      <div className="relative max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-foreground/30 rounded-xl md:rounded-2xl blur-md animate-pulse-soft" />
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/30">
              <GraduationCap className="w-5 h-5 md:w-7 md:h-7" />
            </div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">EduVerse USA</h1>
            <p className="text-xs md:text-sm text-primary-foreground/70 font-medium">
              Your Study Companion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* AI badge - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
            <Sparkles className="w-4 h-4 text-accent animate-pulse-soft" />
            <span className="text-sm font-medium">AI-Powered</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center transition-all duration-300 hover:bg-primary-foreground/20 hover:scale-105"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300" />
            )}
          </button>

          {/* User menu or sign in button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative rounded-full ring-2 ring-primary-foreground/20 hover:ring-primary-foreground/40 transition-all duration-300">
                  <Avatar className="w-9 h-9 md:w-10 md:h-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                    <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-300 text-sm font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
