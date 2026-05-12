import { Wrench } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import { ShopProfile } from "@/modules/orders/types";

interface Props {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
  profile?: ShopProfile;
}

export function Logo({ size = "md", showName = true, className, profile: profileOverride }: Props) {
  const { profile: storeProfile } = useProfile();
  const profile = profileOverride ?? storeProfile;
  const sizes = {
    sm: { box: "h-8 w-8", icon: "h-4 w-4", text: "text-base" },
    md: { box: "h-10 w-10", icon: "h-5 w-5", text: "text-lg" },
    lg: { box: "h-14 w-14", icon: "h-7 w-7", text: "text-2xl" },
  }[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {profile.logoUrl ? (
        <img src={profile.logoUrl} alt={profile.name} className={cn("rounded-xl object-cover", sizes.box)} />
      ) : (
        <div className={cn("flex items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow", sizes.box)}>
          <Wrench className={sizes.icon} strokeWidth={2.5} />
        </div>
      )}
      {showName && (
        <div className="leading-tight">
          <div className={cn("font-display font-extrabold text-foreground", sizes.text)}>
            {profile.name || "Meu Negócio"}
          </div>
          {size === "lg" && profile.address && (
            <div className="text-xs text-muted-foreground">{profile.address}</div>
          )}
        </div>
      )}
    </div>
  );
}
