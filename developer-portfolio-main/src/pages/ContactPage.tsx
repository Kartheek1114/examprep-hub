import { Suspense } from "react";
import Contact from "../components/Contact";

const ContactPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="contact-page-container" style={{ paddingTop: "100px" }}>
        <Contact />
      </div>
    </Suspense>
  );
};

export default ContactPage;
