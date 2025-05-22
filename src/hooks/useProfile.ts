import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface ProfileData {
  name?: string;
  birth_date?: string;
  gender?: "male" | "female" | "other";
  bio?: string;
  profile_image_url?: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/myPage/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("프로필을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: ProfileData) => {
    try {
      const response = await fetch("/api/myPage/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setProfile(profileData);
      toast.success("프로필이 업데이트되었습니다.");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("프로필 업데이트에 실패했습니다.");
      return false;
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
  };
} 