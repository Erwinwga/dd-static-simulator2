"use client";

import { useEffect, useState } from "react";
import { SunFill, MoonFill } from "react-bootstrap-icons";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark";
    setTheme(saved);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Cambiar tema">
      {theme === "dark" ? (
        <><SunFill size={13} /> CLARO</>
      ) : (
        <><MoonFill size={13} /> OSCURO</>
      )}
    </button>
  );
}
