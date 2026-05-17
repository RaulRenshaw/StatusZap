import { cn } from "@/shared/utils/utils";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import { ShopProfile } from "@/modules/orders/types";

import logoPadrao from "@/shared/components/ui/images/LogoPadrao-cropped.svg";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  className?: string;
  profile?: ShopProfile;
}

export function Logo({
  size = "md",
  showName = true,
  className,
  profile: profileOverride,
}: Props) {
  const { profile: storeProfile } = useProfile();
  const profile = profileOverride ?? storeProfile;
const sizes = {
    sm: {
      logo: "h-8",
      text: "text-lg",
    },
    md: {
      logo: "h-11",
      text: "text-2xl",
    },
    lg: {
      logo: "h-16",
      text: "text-3xl",
    },
    xl: {
      logo: "h-14",     // Reduzido levemente para alinhar perfeitamente com a altura da fonte
      text: "text-4xl",    // Tamanho ideal para preencher sem esticar a div invisível
    },
  }[size];

  const logoSrc = profile?.logoUrl || logoPadrao;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3",
        className
      )}
    >
      <img
        src={logoSrc}
        alt={profile?.name || "StatusZap"}
        className={cn(
          sizes.logo,
          "w-auto object-contain shrink-0 select-none"
        )}
        draggable={false}
      />

      {showName && (
        <div className="leading-none">
          <div
            className={cn(
              "font-display font-black tracking-tight text-foreground",
              sizes.text
            )}
          >
            {profile?.name || "StatusZap"}
          </div>

          {size === "lg" && profile?.address && (
            <div className="mt-1 text-xs text-muted-foreground">
              {profile.address}
            </div>
          )}
        </div>
      )}
    </div>
  );
}