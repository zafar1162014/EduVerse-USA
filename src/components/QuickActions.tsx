// Quick action cards shown on new chat - common questions to get started
import { BookOpen, FileText, Award, PenTool } from "lucide-react";
import QuickActionCard from "./QuickActionCard";

interface QuickActionsProps {
  onAction: (query: string) => void;
}

const QuickActions = ({ onAction }: QuickActionsProps) => {
  const actions = [
    {
      icon: BookOpen,
      title: "Admissions Guide",
      description: "Learn about U.S. university application requirements and deadlines",
      query: "What are the requirements for U.S. university admissions?",
    },
    {
      icon: FileText,
      title: "SOP Assistance",
      description: "Get expert help writing a compelling Statement of Purpose",
      query: "Can you help me with my Statement of Purpose?",
    },
    {
      icon: Award,
      title: "Scholarships",
      description: "Discover funding opportunities and financial aid options",
      query: "What scholarships are available for international students?",
    },
    {
      icon: PenTool,
      title: "Test Preparation",
      description: "GRE, TOEFL, IELTS strategies, tips, and study plans",
      query: "How should I prepare for GRE and TOEFL exams?",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {actions.map((action, index) => (
        <QuickActionCard
          key={action.title}
          icon={action.icon}
          title={action.title}
          description={action.description}
          onClick={() => onAction(action.query)}
          delay={index * 80}
        />
      ))}
    </div>
  );
};

export default QuickActions;
