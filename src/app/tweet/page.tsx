import { cookies } from "next/headers";
import TweetForm from "./TweetForm";
import SignInButton from "./SignInButton";

export default function Home() {
  const isAuthenticated = cookies().has("x_access_token");

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Please sign in to post tweets</h1>
        <SignInButton />
      </div>
    );
  }

  return (
    <div>
      <h1>Post a Tweet</h1>
      <TweetForm />
    </div>
  );
}
