"use client";

import { useUserData } from "@/hooks/useUserData";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/button";
import { toast } from "react-toastify";

interface ProfileData {
  profileImage?: string;
  bio?: string;
  name?: string;
  birthDate?: string;
  gender?: "male" | "female" | "other";
}

const Profile = () => {
  const { data: userData } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>({
    profileImage: userData?.profileImage,
    bio: userData?.bio,
    name: userData?.name,
    birthDate: userData?.birthDate,
    gender: userData?.gender
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await fetch("/api/myPage/profile/image", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({ ...prev, profileImage: data.profileImage }));
        toast.success("프로필 이미지가 업데이트되었습니다.");
      } else {
        toast.error("프로필 이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      toast.error("프로필 이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch("/api/myPage/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        toast.success("프로필이 업데이트되었습니다.");
      } else {
        toast.error("프로필 업데이트에 실패했습니다.");
      }
    } catch (error) {
      toast.error("프로필 업데이트 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 mb-4">
            <Image
              src={profileData.profileImage || "/default-profile.png"}
              alt="프로필 이미지"
              fill
              className="rounded-full object-cover"
            />
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 bg-pai-400 text-white p-2 rounded-full cursor-pointer hover:bg-pai-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{userData?.nickname}</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              자기소개
            </label>
            <textarea
              id="bio"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pai-500 focus:ring-pai-500"
              value={profileData.bio || ""}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="자기소개를 입력해주세요"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pai-500 focus:ring-pai-500"
              value={profileData.name || ""}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
              생년월일
            </label>
            <input
              type="date"
              id="birthDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pai-500 focus:ring-pai-500"
              value={profileData.birthDate || ""}
              onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">성별</label>
            <div className="mt-1 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-pai-500"
                  name="gender"
                  value="male"
                  checked={profileData.gender === "male"}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: "male" }))}
                />
                <span className="ml-2">남성</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-pai-500"
                  name="gender"
                  value="female"
                  checked={profileData.gender === "female"}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: "female" }))}
                />
                <span className="ml-2">여성</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-pai-500"
                  name="gender"
                  value="other"
                  checked={profileData.gender === "other"}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: "other" }))}
                />
                <span className="ml-2">기타</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="PAI"
              size="default"
              onClick={handleProfileUpdate}
            >
              프로필 저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 