import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomer, getCustomerOrders } from "@/lib/customer-account";
import Link from "next/link";

export const metadata = {
  title: "My Account",
  description: "View your account details and order history",
};

export default async function AccountPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("customer_access_token")?.value;

  // Redirect to home if not logged in
  if (!accessToken) {
    redirect("/?error=Please+login+to+view+your+account");
  }

  // Fetch customer data
  const customer = await getCustomer(accessToken);
  const { orders } = await getCustomerOrders(accessToken, { first: 5 });
  if (!customer) {
    redirect("/?error=Failed+to+load+account");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Account</h1>
        <Link
          href="/api/auth/logout"
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Logout
        </Link>
      </div>

      {/* Customer Info Card */}
      <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-4 text-xl font-semibold">Account Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Email</p>
            <p className="font-medium">{customer.emailAddress?.emailAddress || "Not provided"}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-4 text-xl font-semibold">Recent Orders</h2>
        
        {orders.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">
            You haven&apos;t placed any orders yet.
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const fulfillmentStatus = order.fulfillments?.edges?.[0]?.node?.status || "UNFULFILLED";
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 p-4 dark:border-neutral-800"
                >
                  <div>
                    <p className="font-medium">Order {order.name || `#${order.number}`}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {new Date(order.processedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: order.totalPrice.currencyCode,
                      }).format(parseFloat(order.totalPrice.amount))}
                    </p>
                    <p className="text-sm">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          fulfillmentStatus === "SUCCESS" || fulfillmentStatus === "FULFILLED"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {fulfillmentStatus.replace("_", " ")}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

