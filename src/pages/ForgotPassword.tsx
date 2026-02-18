import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";

const ForgotPassword = () => {
    const [step, setStep] = useState<"email" | "otp" | "reset">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
            toast.success(res.data.message || "OTP sent to your email!");
            setStep("otp");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return;
        setLoading(true);
        try {
            await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
            toast.success("OTP Verified Successfully!");
            setStep("reset");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await axios.post("http://localhost:5000/api/auth/reset-password", { email, otp, newPassword: password });
            toast.success("Password verified and reset successfully!");
            navigate("/login");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case "email":
                return (
                    <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="font-heading text-2xl font-bold">Forgot Password?</h1>
                            <p className="text-muted-foreground mt-2">Enter your email address to receive a recovery OTP.</p>
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-11"
                                required
                                autoFocus
                            />
                        </div>

                        <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground border-0 shadow-primary-glow" disabled={loading}>
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </Button>

                        <div className="text-center mt-4">
                            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </div>
                    </form>
                );

            case "otp":
                return (
                    <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <KeyRound className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="font-heading text-2xl font-bold">Verify OTP</h1>
                            <p className="text-muted-foreground mt-2">Enter the OTP sent to <span className="font-medium text-foreground">{email}</span></p>
                        </div>

                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="pl-10 h-11 text-center tracking-widest text-lg"
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>

                        <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground border-0 shadow-primary-glow" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </Button>

                        <div className="flex justify-between items-center mt-4">
                            <button type="button" onClick={() => setStep("email")} className="text-sm text-muted-foreground hover:text-foreground">Change Email</button>
                            <button type="button" onClick={handleSendOtp} className="text-sm text-primary hover:underline">Resend OTP</button>
                        </div>
                    </form>
                );

            case "reset":
                return (
                    <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="font-heading text-2xl font-bold">Reset Password</h1>
                            <p className="text-muted-foreground mt-2">Create a new secure password for your account.</p>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 h-11"
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10 h-11"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground border-0 shadow-primary-glow" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                );
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                <div className="relative text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl gradient-secondary flex items-center justify-center mx-auto mb-6 animate-float">
                        <BookOpen className="w-8 h-8 text-secondary-foreground" />
                    </div>
                    <h2 className="font-heading text-3xl font-bold text-primary-foreground mb-4">Secure your Future</h2>
                    <p className="text-primary-foreground/70">Regain access to your personalized learning dashboard and continue your journey.</p>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-heading text-xl font-bold">Prepnovus</span>
                    </Link>

                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
