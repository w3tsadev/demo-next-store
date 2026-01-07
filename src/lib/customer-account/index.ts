import { isShopifyError } from "../type-guards";
import {
  getCustomerQuery,
  getCustomerOrdersQuery,
  getCustomerAddressesQuery,
} from "./queries/customer";
import {
  customerUpdateMutation,
  customerAddressCreateMutation,
  customerAddressUpdateMutation,
  customerAddressDeleteMutation,
} from "./mutations/customer";
import {
  Customer,
  CustomerAddress,
  Order,
  CustomerOperation,
  CustomerOrdersOperation,
  CustomerAddressesOperation,
  CustomerUpdateOperation,
  CustomerAddressCreateOperation,
  CustomerAddressUpdateOperation,
  CustomerAddressDeleteOperation,
} from "./types";

// Customer Account API endpoint
const CUSTOMER_ACCOUNT_API_VERSION = "2024-01";

const getCustomerAccountApiUrl = () => {
  // If custom URL is provided, use it
  if (process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL) {
    return process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
  }
  
  const shopId = process.env.SHOPIFY_SHOP_ID;
  
  if (!shopId) {
    throw new Error("SHOPIFY_SHOP_ID environment variable is required");
  }
  
  // Customer Account API endpoint format
  // See: https://shopify.dev/docs/api/customer
  return `https://shopify.com/${shopId}/account/customer/api/${CUSTOMER_ACCOUNT_API_VERSION}/graphql`;
};

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

/**
 * Fetch data from the Shopify Customer Account API
 * Requires a valid customer access token obtained through OAuth
 */
export async function customerAccountFetch<T>({
  accessToken,
  query,
  variables,
  cache = "no-store",
}: {
  accessToken: string;
  query: string;
  variables?: ExtractVariables<T>;
  cache?: RequestCache;
}): Promise<{ status: number; body: T } | never> {
  const endpoint = getCustomerAccountApiUrl();

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      cache,
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (error) {
    if (isShopifyError(error)) {
      throw {
        cause: error.cause?.toString() || "unknown",
        status: error.status || 500,
        message: error.message,
        query,
      };
    }

    throw {
      error,
      query,
    };
  }
}

// Helper to get edges/nodes
function removeEdgesAndNodes<T>(array: { edges: Array<{ node: T }> }): T[] {
  return array.edges.map((edge) => edge.node);
}

/**
 * Get the current customer's profile
 */
export async function getCustomer(
  accessToken: string
): Promise<Customer | null> {
  try {
    const res = await customerAccountFetch<CustomerOperation>({
      accessToken,
      query: getCustomerQuery,
    });

    return res.body.data.customer;
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return null;
  }
}

/**
 * Get customer orders
 */
export async function getCustomerOrders(
  accessToken: string,
  options?: { first?: number; after?: string }
): Promise<{ orders: Order[]; pageInfo: CustomerOrdersOperation["data"]["customer"]["orders"]["pageInfo"] }> {
  try {
    const res = await customerAccountFetch<CustomerOrdersOperation>({
      accessToken,
      query: getCustomerOrdersQuery,
      variables: {
        first: options?.first || 10,
        after: options?.after,
      },
    });

    const orders = removeEdgesAndNodes(res.body.data.customer.orders);
    return {
      orders,
      pageInfo: res.body.data.customer.orders.pageInfo,
    };
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
    return {
      orders: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        endCursor: null,
        startCursor: null,
      },
    };
  }
}

/**
 * Get customer addresses
 */
export async function getCustomerAddresses(
  accessToken: string
): Promise<CustomerAddress[]> {
  try {
    const res = await customerAccountFetch<CustomerAddressesOperation>({
      accessToken,
      query: getCustomerAddressesQuery,
    });

    return removeEdgesAndNodes(res.body.data.customer.addresses);
  } catch (error) {
    console.error("Failed to fetch customer addresses:", error);
    return [];
  }
}

/**
 * Update customer profile
 */
export async function updateCustomer(
  accessToken: string,
  customer: CustomerUpdateOperation["variables"]["customer"]
): Promise<{ customer: Customer | null; errors: Array<{ field: string[]; message: string }> }> {
  try {
    const res = await customerAccountFetch<CustomerUpdateOperation>({
      accessToken,
      query: customerUpdateMutation,
      variables: { customer },
    });

    return {
      customer: res.body.data.customerUpdate.customer,
      errors: res.body.data.customerUpdate.userErrors,
    };
  } catch (error) {
    console.error("Failed to update customer:", error);
    return {
      customer: null,
      errors: [{ field: ["_"], message: "Failed to update customer" }],
    };
  }
}

/**
 * Create a new customer address
 */
export async function createCustomerAddress(
  accessToken: string,
  address: CustomerAddressCreateOperation["variables"]["address"]
): Promise<{ address: CustomerAddress | null; errors: Array<{ field: string[]; message: string }> }> {
  try {
    const res = await customerAccountFetch<CustomerAddressCreateOperation>({
      accessToken,
      query: customerAddressCreateMutation,
      variables: { address },
    });

    return {
      address: res.body.data.customerAddressCreate.customerAddress,
      errors: res.body.data.customerAddressCreate.userErrors,
    };
  } catch (error) {
    console.error("Failed to create customer address:", error);
    return {
      address: null,
      errors: [{ field: ["_"], message: "Failed to create address" }],
    };
  }
}

/**
 * Update a customer address
 */
export async function updateCustomerAddress(
  accessToken: string,
  addressId: string,
  address: CustomerAddressUpdateOperation["variables"]["address"]
): Promise<{ address: CustomerAddress | null; errors: Array<{ field: string[]; message: string }> }> {
  try {
    const res = await customerAccountFetch<CustomerAddressUpdateOperation>({
      accessToken,
      query: customerAddressUpdateMutation,
      variables: { addressId, address },
    });

    return {
      address: res.body.data.customerAddressUpdate.customerAddress,
      errors: res.body.data.customerAddressUpdate.userErrors,
    };
  } catch (error) {
    console.error("Failed to update customer address:", error);
    return {
      address: null,
      errors: [{ field: ["_"], message: "Failed to update address" }],
    };
  }
}

/**
 * Delete a customer address
 */
export async function deleteCustomerAddress(
  accessToken: string,
  addressId: string
): Promise<{ deletedAddressId: string | null; errors: Array<{ field: string[]; message: string }> }> {
  try {
    const res = await customerAccountFetch<CustomerAddressDeleteOperation>({
      accessToken,
      query: customerAddressDeleteMutation,
      variables: { addressId },
    });

    return {
      deletedAddressId: res.body.data.customerAddressDelete.deletedAddressId,
      errors: res.body.data.customerAddressDelete.userErrors,
    };
  } catch (error) {
    console.error("Failed to delete customer address:", error);
    return {
      deletedAddressId: null,
      errors: [{ field: ["_"], message: "Failed to delete address" }],
    };
  }
}

