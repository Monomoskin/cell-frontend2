import Sidebar from "../components/Sidebar/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import styles from "./layout.module.less";
import { useEffect, useState } from "react";

export default function DahsboardLayout() {
  const darkMode = true;
  const [activeLink, setActiveLink] = useState("dashboard");
  const location = useLocation();
  const navLinks = [
    { name: "dashboard", path: "/cel/" },
    { name: "measurements", path: "/cel/measurements" },
    { name: "cells", path: "/cel/cells" },
  ];
  const currentPath = navLinks.find((link) => link.path == location.pathname);

  useEffect(() => {
    if (currentPath) {
      setActiveLink(currentPath.name);
    }
  }, [location.pathname, currentPath]);

  return (
    <div className={styles.mainLayout}>
      <Sidebar darkMode={darkMode} activeLink={activeLink} />
      <div className={styles.bodyDark}>
        <Outlet />
      </div>
    </div>
  );
}
