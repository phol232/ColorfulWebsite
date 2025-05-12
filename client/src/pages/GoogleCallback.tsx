// src/pages/GoogleCallback.tsx
import { useEffect } from "react";
import { useLocation } from "wouter";

const GoogleCallback: React.FC = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      setLocation("/dashboard");
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  return <div className="p-4 text-center">Redirigiendo…</div>;
};

export default GoogleCallback;
