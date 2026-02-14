import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, TrendingUp } from "lucide-react";

interface ExamCardProps {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  category: string;
  vacancies: string;
  nextExamDate: string;
  lastCutoff: string;
}

const ExamCard = ({ id, shortName, description, icon, category, vacancies, nextExamDate, lastCutoff }: ExamCardProps) => (
  <Link to={`/exams/${id}`} className="group block">
    <div className="bg-card rounded-xl border border-border p-6 hover-lift shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{icon}</div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{category}</span>
      </div>
      <h3 className="font-heading text-lg font-bold mb-2 group-hover:text-primary transition-colors">{shortName}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5 text-accent" />
          <span>{vacancies}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 text-secondary" />
          <span>{nextExamDate}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span>Cut-off</span>
        </div>
      </div>
      <div className="flex items-center text-sm font-medium text-primary group-hover:gap-3 gap-1.5 transition-all">
        View Details <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  </Link>
);

export default ExamCard;
