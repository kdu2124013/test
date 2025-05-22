import { Profile } from "./_components/Profile";
import { MyInfo } from "./_components/MyInfo";

export default function MyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Profile />
        <MyInfo />
      </div>
    </div>
  );
}
