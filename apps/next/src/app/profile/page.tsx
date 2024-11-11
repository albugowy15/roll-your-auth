import { fetchWithSession } from "@/lib/api";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - Roll your auth",
};

async function getProfile() {
  return await fetchWithSession<{ id: string; username: string }>("/profile", {
    method: "GET",
  });
}

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div>
      <p>token : {JSON.stringify(profile.data)}</p>
    </div>
  );
}
