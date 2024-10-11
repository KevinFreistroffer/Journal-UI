import { cookies } from "next/headers";
import TweetForm from "./TweetForm";
import SignInButton from "./SignInButton";

export default function Home() {
  const isAuthenticated = cookies().has("x_access_token");

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center minh-screen">
        <h1>Please sign in to post tweets</h1>
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Post a Tweet</h1>
      <TweetForm />
    </div>
  );
}
