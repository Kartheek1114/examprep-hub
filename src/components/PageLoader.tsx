import { BookOpen } from "lucide-react";

const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background animate-fade-in">
            {/* Top progress bar */}
            <div className="fixed top-0 left-0 w-full h-1 overflow-hidden bg-muted">
                <div className="h-full gradient-primary animate-loading-progress w-full shadow-[0_0_10px_rgba(40,98,58,0.5)]" />
            </div>

            <div className="relative">
                {/* Pulsing emerald rings */}
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />

                <div className="relative w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-primary-glow animate-scale-pulse">
                    <BookOpen className="w-10 h-10 text-primary-foreground animate-float" />
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
                <span className="font-heading text-xl font-bold text-foreground">Prepnovus</span>
                <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '200ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
