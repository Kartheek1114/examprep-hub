import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import Lenis from "lenis";
import { Link, useLocation } from "react-router-dom";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollTrigger);
export let lenis: Lenis | null = null;

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    // Initialize Lenis smooth scroll ONLY ONCE
    lenis = new Lenis({
      duration: 1.7,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.7,
      touchMultiplier: 2,
      infinite: false,
    });

    // Handle smooth scroll animation frame
    function raf(time: number) {
      lenis?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Handle resize
    const onResize = () => lenis?.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // Separate effect for navigation and hash-based scrolling
  useEffect(() => {
    // Scroll to section if hash exists in URL on mount/change
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash && lenis) {
        // Function to attempt scrolling
        const attemptScroll = (retryCount = 0) => {
          const target = document.querySelector(hash) as HTMLElement;
          if (target) {
            setTimeout(() => {
              lenis?.scrollTo(target, {
                offset: 0,
                duration: 1.2,
                immediate: false,
              });
            }, retryCount === 0 ? 600 : 100); // Longer delay on first attempt
          } else if (retryCount < 10) {
            // If target not found yet (still rendering), retry after a short delay
            setTimeout(() => attemptScroll(retryCount + 1), 200);
          }
        };
        attemptScroll();
      }
    };

    handleHashScroll();

    // Handle internal navigation links with smooth scroll on home page
    let links = document.querySelectorAll(".header ul a[data-href]");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      const onClick = (e: MouseEvent) => {
        let section = element.getAttribute("data-href");
        if (isHome && section && lenis) {
          e.preventDefault();
          const target = document.querySelector(section) as HTMLElement;
          if (target) {
            lenis.scrollTo(target, {
              offset: 0,
              duration: 1.5,
            });
          }
        }
      };
      element.addEventListener("click", onClick);
      return () => element.removeEventListener("click", onClick);
    });
  }, [isHome, location.pathname, location.hash]);
  return (
    <>
      <div className="header">
        <Link
          to="/"
          className="navbar-title"
          data-cursor="disable"
          onClick={() => {
            if (isHome && lenis) {
              lenis.scrollTo(0, { duration: 1.5 });
            }
          }}
        >
          <img src="/images/logo.png" alt="Logo" className="navbar-logo-img" />
        </Link>
        <a
          href="mailto:kartheek04112004@gmail.com"
          className="navbar-connect"
          data-cursor="disable"
        >
          kartheek04112004@gmail.com
        </a>
        <ul>
          <li>
            <Link data-href="#about" to="/#about">
              <HoverLinks text="ABOUT ME" />
            </Link>
          </li>
          <li>
            <Link to="/myworks">
              <HoverLinks text="MY WORK" />
            </Link>
          </li>
          <li>
            <Link to="/achievements">
              <HoverLinks text="ACHIEVEMENTS" />
            </Link>
          </li>
          <li>
            <Link to="/contact">
              <HoverLinks text="CONTACT ME" />
            </Link>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
