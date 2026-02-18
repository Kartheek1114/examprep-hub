import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-card border-t border-border mt-auto">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <img src="/logo.svg" alt="Prepnovus Logo" className="h-8 w-auto" />
          </Link>
          <p className="text-sm text-muted-foreground">Your one-stop platform for government exam preparation. Practice, learn, and succeed.</p>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3">Exams</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/exams/ssc-cgl" className="hover:text-primary transition-colors">SSC CGL</Link>
            <Link to="/exams/upsc-cse" className="hover:text-primary transition-colors">UPSC CSE</Link>
            <Link to="/exams/ibps-po" className="hover:text-primary transition-colors">IBPS PO</Link>
            <Link to="/exams/rrb-ntpc" className="hover:text-primary transition-colors">RRB NTPC</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3">Resources</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>Syllabus</span>
            <span>Previous Year Papers</span>
            <span>Cut-off Analysis</span>
            <span>Study Materials</span>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3">Support</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>Help Center</span>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
        © 2026 Prepnovus. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
