import { cookies } from "next/headers";

export default function CookieStatus() {
  const cookieStore = cookies();
  const consent = cookieStore.get("cookieConsent");

  return (
    <div>
      {consent?.value === "true" && <p>Cookies accepted</p>}
      {consent?.value === "false" && <p>Cookies denied</p>}
      {!consent && <p>Cookie consent not set</p>}
    </div>
  );
}
