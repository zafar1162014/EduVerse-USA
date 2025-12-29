import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { GraduationCap, Sparkles, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const emailAuthSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
});

const resetEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be less than 72 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type EmailAuthValues = z.infer<typeof emailAuthSchema>;
type ResetEmailValues = z.infer<typeof resetEmailSchema>;
type NewPasswordValues = z.infer<typeof newPasswordSchema>;

const Auth = () => {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, updatePassword } =
    useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [view, setView] = useState<"auth" | "forgot" | "reset">("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we're in password reset mode
  useEffect(() => {
    const resetMode = searchParams.get("mode");
    if (resetMode === "reset") {
      setView("reset");
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !loading && view !== "reset") navigate("/");
  }, [user, loading, navigate, view]);

  const authForm = useForm<EmailAuthValues>({
    resolver: zodResolver(emailAuthSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const forgotForm = useForm<ResetEmailValues>({
    resolver: zodResolver(resetEmailSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const resetForm = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onSubmit",
  });

  const submitLabel = useMemo(
    () => (mode === "signin" ? "Sign in" : "Create account"),
    [mode]
  );

  const onAuthSubmit = async (values: EmailAuthValues) => {
    setIsSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(values.email, values.password);
      } else {
        await signUpWithEmail(values.email, values.password);
      }
    } catch {
      // Error is handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForgotSubmit = async (values: ResetEmailValues) => {
    setIsSubmitting(true);
    try {
      await resetPassword(values.email);
      forgotForm.reset();
    } catch {
      // Error is handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (values: NewPasswordValues) => {
    setIsSubmitting(true);
    try {
      await updatePassword(values.password);
      navigate("/");
    } catch {
      // Error is handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign In - EduVerse USA</title>
        <meta
          name="description"
          content="Sign in to EduVerse USA to access your personalized study assistant and chat history."
        />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-chat p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <main className="relative w-full max-w-md" aria-label="Authentication">
          <article className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 animate-fade-in">
            <header className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-hero rounded-2xl blur-lg opacity-50 animate-pulse-soft" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center">
                  <GraduationCap className="w-9 h-9 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">EduVerse USA</h1>
              <p className="text-muted-foreground text-sm mt-1">Your Study Companion</p>
            </header>

            {/* Forgot Password View */}
            {view === "forgot" && (
              <section className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("auth")}
                  className="mb-2 -ml-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Reset your password
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                <form className="space-y-4" onSubmit={forgotForm.handleSubmit(onForgotSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...forgotForm.register("email")}
                    />
                    {forgotForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {forgotForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </form>
              </section>
            )}

            {/* New Password View (after clicking reset link) */}
            {view === "reset" && (
              <section className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Set new password
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Enter your new password below
                  </p>
                </div>

                <form className="space-y-4" onSubmit={resetForm.handleSubmit(onResetSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="pr-10"
                        {...resetForm.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {resetForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {resetForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="pr-10"
                        {...resetForm.register("confirmPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {resetForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {resetForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </form>
              </section>
            )}

            {/* Main Auth View */}
            {view === "auth" && (
              <>
                <section className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {mode === "signin" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {mode === "signin"
                      ? "Sign in to access your chat history and personalized assistance"
                      : "Sign up to save your chat history and continue on any device"}
                  </p>
                </section>

                <section className="space-y-4">
                  <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="signin">Sign in</TabsTrigger>
                      <TabsTrigger value="signup">Sign up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="mt-4">
                      <form className="space-y-4" onSubmit={authForm.handleSubmit(onAuthSubmit)}>
                        <div className="space-y-2">
                          <Label htmlFor="signin-email">Email</Label>
                          <Input
                            id="signin-email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            {...authForm.register("email")}
                          />
                          {authForm.formState.errors.email && (
                            <p className="text-sm text-destructive">
                              {authForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="signin-password">Password</Label>
                            <Button
                              type="button"
                              variant="link"
                              className="text-xs text-primary h-auto p-0"
                              onClick={() => setView("forgot")}
                            >
                              Forgot password?
                            </Button>
                          </div>
                          <div className="relative">
                            <Input
                              id="signin-password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              className="pr-10"
                              {...authForm.register("password")}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                          {authForm.formState.errors.password && (
                            <p className="text-sm text-destructive">
                              {authForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 rounded-xl"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            submitLabel
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="mt-4">
                      <form className="space-y-4" onSubmit={authForm.handleSubmit(onAuthSubmit)}>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            {...authForm.register("email")}
                          />
                          {authForm.formState.errors.email && (
                            <p className="text-sm text-destructive">
                              {authForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              className="pr-10"
                              {...authForm.register("password")}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                          {authForm.formState.errors.password && (
                            <p className="text-sm text-destructive">
                              {authForm.formState.errors.password.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Must be at least 8 characters
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 rounded-xl"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            submitLabel
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
                    </div>
                  </div>

                  <Button
                    onClick={signInWithGoogle}
                    className="w-full h-12 rounded-xl flex items-center justify-center gap-3"
                    variant="outline"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </section>
              </>
            )}

            <footer className="mt-8 flex items-center justify-center gap-2 text-muted-foreground text-xs">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>AI-Powered Study Assistant</span>
            </footer>
          </article>

          <p className="text-center text-muted-foreground text-xs mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </main>
      </div>
    </>
  );
};

export default Auth;
