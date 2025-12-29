// Main chat page - shows the header and chat interface
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import ChatInterface from "@/components/ChatInterface";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { loading } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>EduVerse USA - Study Assistant for U.S. Higher Education</title>
        <meta
          name="description"
          content="EduVerse USA helps international students with U.S. university admissions, Statement of Purpose guidance, scholarships, and GRE/TOEFL/IELTS test preparation."
        />
      </Helmet>

      <div className="flex flex-col h-screen bg-background">
        <Header />
        <main className="flex-1 overflow-hidden">
          <ChatInterface />
        </main>
      </div>
    </>
  );
};

export default Index;
