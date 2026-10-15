import Navbar from "./Navbar";
import AppHeader from "./AppHeader";
import { useLanguage } from "../context/useLanguage";

function Layout({ children }) {
  const { language } = useLanguage();

  const isPersian = language === "fa";

  return (
    <div className="app-layout">
      <Navbar />

      <div className={`app-content-area ${isPersian ? "app-content-area-rtl" : ""}`}>
        <AppHeader />
        <main className={`page-wrapper ${isPersian ? "page-wrapper-rtl" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
