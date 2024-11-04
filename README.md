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

- `createClientSession(userId: string)`: Creates a new session for the specified user ID.
- `updateClientSession()`: Updates the current session's expiration time.
- `deleteSessions()`: Deletes the current session.

For more details, refer to the `src/lib/session.ts` file.
