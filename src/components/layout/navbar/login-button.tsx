import { UserIcon } from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getCustomer } from '@/lib/customer-account';

export default async function LoginButton() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("customer_access_token")?.value;

  if (accessToken) {
    const customer = await getCustomer(accessToken);
    const displayName = customer?.emailAddress?.emailAddress || "Account";
    
    return (
      <Link
        href="/account"
        className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        <UserIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{displayName}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/api/auth/login"
      className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
    >
      <UserIcon className="h-4 w-4" />
      <span className="hidden sm:inline">Login</span>
    </Link>
  );
}
