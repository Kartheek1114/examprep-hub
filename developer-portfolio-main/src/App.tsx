import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";


const MainContainer = lazy(() => import("./components/MainContainer"));
const MyWorks = lazy(() => import("./pages/MyWorks"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Navbar = lazy(() => import("./components/Navbar"));
const SocialIcons = lazy(() => import("./components/SocialIcons"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <Suspense fallback={null}>
          <Navbar />
          <SocialIcons />
        </Suspense>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense>
                <MainContainer />
              </Suspense>
            }
          />
          <Route
            path="/myworks"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <MyWorks />
              </Suspense>
            }
          />
           <Route
             path="/achievements"
             element={
               <Suspense fallback={<div>Loading...</div>}>
                 <Achievements />
               </Suspense>
             }
           />
           <Route
             path="/contact"
             element={
               <Suspense fallback={<div>Loading...</div>}>
                 <ContactPage />
               </Suspense>
             }
           />
        </Routes>
        <Analytics />
      </LoadingProvider>
    </BrowserRouter>
  );
};

export default App;
