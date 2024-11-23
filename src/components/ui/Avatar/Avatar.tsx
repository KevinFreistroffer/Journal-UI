import Image from "next/image";

interface AvatarProps {
  avatarUrl?: string;
  username?: string;
  name?: string;
  size?: number;
  className?: string;
}

const Avatar = ({
  avatarUrl,
  username,
  name,
  size = 40,
  className = "",
}: AvatarProps) => {
  if (!avatarUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-blue-500 text-white text-lg font-medium rounded-full ${className}`}
        style={{ width: size, height: size, maxWidth: size, maxHeight: size }}
      >
        {username?.charAt(0).toUpperCase() ||
          name?.charAt(0).toUpperCase() ||
          "?"}
      </div>
    );
  }

  return (
    <Image
      src={avatarUrl}
      alt={name || "User avatar"}
      width={size}
      height={size}
      className={`object-cover rounded-full ${className}`}
      style={{ maxWidth: size, maxHeight: size }}
    />
  );
};

export default Avatar;
