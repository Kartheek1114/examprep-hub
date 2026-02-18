import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MessageSquare, Send, MapPin, Phone } from "lucide-react";

/**
 * Contact Component
 * A premium, monochrome contact page for Prepnovus.
 */
const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        // Simulating an API call
        setTimeout(() => {
            console.log("Contact Form Data:", formData);
            toast.success("Message sent successfully! We will get back to you soon.");
            setFormData({ name: "", email: "", subject: "", message: "" });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16 animate-slide-up">
                        <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6">
                            Get in <span className="text-gradient">Touch</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Have questions or feedback? We'd love to hear from you.
                            Our team typically responds within 24 hours.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        {/* Contact Information */}
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-card rounded-3xl p-8 border border-border shadow-xl">
                                <h3 className="font-heading text-2xl font-bold mb-8">Contact Information</h3>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Mail className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Email Us</p>
                                            <p className="text-lg font-medium">support@prepnovus.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Phone className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Call Us</p>
                                            <p className="text-lg font-medium">+91 (800) 123-4567</p>
                                        </div>
                                    </div>

                                    {/*     */}
                                </div>

                                <div className="mt-10 p-6 rounded-2xl bg-muted/30 border border-border/50">
                                    <div className="flex items-center gap-3 mb-3">
                                        <MessageSquare className="w-5 h-5 text-primary" />
                                        <p className="font-bold">Live Support</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Our support agents are available Monday to Friday, 9:00 AM - 6:00 PM IST.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-card rounded-3xl p-8 border border-border shadow-xl animate-fade-in shadow-primary-glow/5">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            className="h-12 bg-background/50 rounded-xl"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            className="h-12 bg-background/50 rounded-xl"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="How can we help?"
                                        className="h-12 bg-background/50 rounded-xl"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Message</Label>
                                    <textarea
                                        id="message"
                                        rows={5}
                                        className="w-full p-4 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed transition-all resize-none hover:border-primary/50"
                                        placeholder="Write your message here..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                                >
                                    {loading ? "Sending..." : "Send Message"}
                                    {!loading && <Send className="w-5 h-5" />}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
