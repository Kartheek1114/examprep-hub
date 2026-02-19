import { useNavigate, Link, useLocation } from "react-router-dom";
import { BookOpen, Menu, X, User, LogOut, Camera, Save, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Exams", path: "/exams" },
  { label: "Practice", path: "/practice" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Admin", path: "/admin/upload" },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setUserEmail(localStorage.getItem("userEmail"));

    if (token) {
      fetchUserData();
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
        setIsEditingProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await api.get("/api/user/me");
      setUserData(res.data);
      setName(res.data.name);
      setProfilePic(res.data.profilePicture || "");
    } catch (err) {
      console.error("Failed to fetch user data");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    try {
      // Show loading state
      const updatePayload = { name: name.trim(), profilePicture: profilePic };

      const res = await api.patch("/api/user/me", updatePayload);

      setUserData(res.data);
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to update profile";
      toast.error(errorMessage);
      console.error("Profile update error:", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("Image size must be less than 10MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;

        // Check if the base64 string is too large (more than 2MB)
        if (result.length > maxSize) {
          toast.error("Image is too large. Please select a smaller image.");
          return;
        }

        setProfilePic(result);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserEmail(null);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/logo.svg"
            alt="Prepnovus Logo"
            className="h-10 w-auto group-hover:scale-105 transition-transform"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.filter(item => {
            if (item.label === "Admin") {
              const adminEmail = "kartheek04112004@gmail.com";
              return isLoggedIn && userEmail?.toLowerCase().trim() === adminEmail.toLowerCase().trim();
            }
            return true;
          }).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === item.path
                ? "gradient-primary text-primary-foreground shadow-primary-glow"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gradient-primary text-primary-foreground border-0 shadow-primary-glow hover:opacity-90 transition-opacity">
                  Sign Up Free
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border-2 border-primary/20 flex items-center justify-center">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl border border-border shadow-lg p-4 animate-fade-in z-50">
                    {!isEditingProfile ? (
                      <>
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border-2 border-primary/20 flex items-center justify-center">
                            {profilePic ? (
                              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading text-lg font-bold truncate">{userData?.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{userData?.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingProfile(true)}
                          className="w-full gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Edit Profile
                        </Button>
                      </>
                    ) : (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="flex flex-col items-center gap-3 mb-4 pb-4 border-b border-border">
                          <div className="relative group">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-primary/20 flex items-center justify-center">
                              {profilePic ? (
                                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-10 h-10 text-muted-foreground" />
                              )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-1.5 rounded-full gradient-primary text-primary-foreground cursor-pointer shadow-lg hover:scale-110 transition-transform">
                              <Camera className="w-3 h-3" />
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                          </div>
                          {profilePic && (
                            <p className="text-xs text-muted-foreground text-center">
                              Image size: {Math.round(profilePic.length / 1024)}KB
                              {profilePic.length > 1024 * 1024 && <span className="text-amber-500 ml-1">(Large)</span>}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            Click camera icon to change photo<br />(Max: 10MB)
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1.5">Display Name</label>
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="h-9 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1.5">Email Address</label>
                          <Input
                            value={userData?.email}
                            disabled
                            className="h-9 text-sm bg-muted text-muted-foreground cursor-not-allowed"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button type="submit" size="sm" className="gradient-primary text-primary-foreground border-0 shadow-primary-glow gap-1.5 flex-1">
                            <Save className="w-3 h-3" /> Save
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => {
                            setIsEditingProfile(false);
                            setName(userData?.name || "");
                            setProfilePic(userData?.profilePicture || "");
                          }} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive hover:bg-transparent">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto">
          <div className="flex flex-col p-4 gap-2">
            {isLoggedIn && (
              <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl bg-muted/50 border border-border">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border-2 border-primary/20 flex items-center justify-center">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold truncate">{userData?.name || "Aspirant"}</h3>
                  <p className="text-xs text-muted-foreground truncate">{userData?.email}</p>
                </div>
              </div>
            )}

            {navItems.filter(item => {
              if (item.label === "Admin") {
                const adminEmail = "kartheek04112004@gmail.com";
                return isLoggedIn && userEmail?.toLowerCase().trim() === adminEmail.toLowerCase().trim();
              }
              return true;
            }).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${location.pathname === item.path
                  ? "gradient-primary text-primary-foreground shadow-primary-glow"
                  : "text-muted-foreground hover:bg-muted"
                  }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
              {!isLoggedIn ? (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="w-full" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full h-12 rounded-xl">Login</Button>
                  </Link>
                  <Link to="/signup" className="w-full" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full h-12 rounded-xl gradient-primary text-primary-foreground border-0 shadow-primary-glow">Sign Up Free</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full h-12 rounded-xl gap-2">
                      <Settings className="w-4 h-4" /> My Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
