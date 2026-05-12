import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
      <div className="max-w-md text-center">
        <div className="font-display text-7xl font-extrabold text-primary">404</div>
        <h1 className="mt-4 font-display text-2xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-muted-foreground">A página que você procura não existe ou foi movida.</p>
        <Button asChild className="mt-6 gap-2 rounded-xl">
          <Link to="/">
            <Home className="h-4 w-4" />
            Voltar pro início
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
