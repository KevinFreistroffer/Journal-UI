import Link from "next/link";

interface SettingsSidebarProps {
  isLoading: boolean;
  onChangeUsername: () => void;
}

const SettingsSidebar = ({
  isLoading,
  onChangeUsername,
}: SettingsSidebarProps) => {
  return (
    <div
      className={`fixed mt-[57px] top-0 left-0 h-full bg-gray-100 p-4 overflow-y-auto transition-[width] duration-300 ease-in-out z-30 dark:bg-black dark:border-r-1 w-56`}
    >
      <div
        className={`flex flex-col transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="mb-8 pb-2">
          <div className="mt-2 text-xs md:text-sm font-normal text-gray-600 dark:text-white">
            <div className="space-y-2">
              <button
                type="button"
                onClick={onChangeUsername}
                className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                Change username
              </button>
              <Link
                href="/settings/password"
                className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                Change password
              </Link>
              <Link
                href="/settings/notifications"
                className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                Notifications
              </Link>
              <Link
                href="/settings/delete-account"
                className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-red-500"
              >
                Delete account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
