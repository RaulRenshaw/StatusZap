import { useCallback, useEffect, useState } from "react";
import { ShopProfile } from "@/modules/orders/types";
import { profileService } from "@/modules/profile/services/profile.service";
import { DEFAULT_PROFILE } from "@/modules/profile/constants";

export function useProfile() {
  const [profile, setProfile] = useState<ShopProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await profileService.get();
      setProfile(data);
    } catch (e: any) {
      // If 401, http.ts handles redirect. Otherwise silent — use default.
      setError(e?.message ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, error, refresh, setProfile };
}
