This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication Flow

### Login

The login functionality is implemented in the `src/actions/login.ts` file. Here's an example of how to use the login function:

```typescript
import { login } from "@/actions/login";

const formData = new FormData();
formData.append("usernameOrEmail", "example@example.com");
formData.append("password", "password123");

const result = await login(initialState, formData);
if (result.redirect) {
  // Redirect to the specified URL
  router.push(result.redirect);
} else {
  // Handle login errors
  console.error(result.message);
}
```

### Signup

The signup functionality is implemented in the `src/actions/signup.ts` file. Here's an example of how to use the signup function:

```typescript
import { signUp } from "@/actions/signup";

const formData = new FormData();
formData.append("username", "exampleUser");
formData.append("email", "example@example.com");
formData.append("password", "password123");
formData.append("confirmPassword", "password123");

const result = await signUp(initialState, formData);
if (result.message === "Account created successfully.") {
  // Handle successful signup
  console.log(result.message);
} else {
  // Handle signup errors
  console.error(result.message);
}
```

### Logout

The logout functionality is implemented in the `src/actions/auth.ts` file. Here's an example of how to use the logout function:

```typescript
import { logout } from "@/actions/auth";

await logout();
// Redirect to the login page
router.push("/login");
```

### Session Management

Session management is handled in the `src/lib/session.ts` file. It includes functions for creating, updating, and deleting sessions. Here's a brief overview of the session management functions:

- `createSession(userId: string)`: Creates a new session for the specified user ID.
- `updateSession()`: Updates the current session's expiration time.
- `deleteSession()`: Deletes the current session.

For more details, refer to the `src/lib/session.ts` file.
