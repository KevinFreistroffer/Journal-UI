"use client";

export default function SignInButton() {
  const handleAuth = () => {
    window.location.href = "/api/auth/x/auth";
  };

  return <button onClick={handleAuth}>Sign in with Twitter</button>;
}
