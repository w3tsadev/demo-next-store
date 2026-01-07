// Customer Account API Types

export type CustomerAddress = {
  id: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  company: string | null;
  country: string | null;
  countryCode: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  province: string | null;
  provinceCode: string | null;
  zip: string | null;
};

export type Customer = {
  firstName: string | null;
  lastName: string | null;
  emailAddress: {
    emailAddress: string;
  } | null;
};

export type OrderLineItem = {
  title: string;
  quantity: number;
  price: {
    amount: string;
    currencyCode: string;
  };
  image: {
    url: string;
    altText: string | null;
  } | null;
};

export type OrderFulfillment = {
  status: string;
};

export type Order = {
  id: string;
  number: number;
  name: string;
  processedAt: string;
  financialStatus: string;
  fulfillments: {
    edges: Array<{
      node: OrderFulfillment;
    }>;
  };
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  lineItems: {
    edges: Array<{
      node: OrderLineItem;
    }>;
  };
};

export type CustomerOrdersConnection = {
  edges: Array<{
    node: Order;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    endCursor: string | null;
    startCursor: string | null;
  };
};

// Operation Types

export type CustomerOperation = {
  data: {
    customer: Customer;
  };
};

export type CustomerOrdersOperation = {
  data: {
    customer: {
      orders: CustomerOrdersConnection;
    };
  };
  variables: {
    first?: number;
    after?: string;
  };
};

export type CustomerAddressesOperation = {
  data: {
    customer: {
      addresses: {
        edges: Array<{
          node: CustomerAddress;
        }>;
      };
    };
  };
};

export type CustomerUpdateOperation = {
  data: {
    customerUpdate: {
      customer: Customer;
      userErrors: Array<{
        field: string[];
        message: string;
      }>;
    };
  };
  variables: {
    customer: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };
  };
};

export type CustomerAddressCreateOperation = {
  data: {
    customerAddressCreate: {
      customerAddress: CustomerAddress;
      userErrors: Array<{
        field: string[];
        message: string;
      }>;
    };
  };
  variables: {
    address: {
      address1?: string;
      address2?: string;
      city?: string;
      company?: string;
      country?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      province?: string;
      zip?: string;
    };
  };
};

export type CustomerAddressUpdateOperation = {
  data: {
    customerAddressUpdate: {
      customerAddress: CustomerAddress;
      userErrors: Array<{
        field: string[];
        message: string;
      }>;
    };
  };
  variables: {
    addressId: string;
    address: {
      address1?: string;
      address2?: string;
      city?: string;
      company?: string;
      country?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      province?: string;
      zip?: string;
    };
  };
};

export type CustomerAddressDeleteOperation = {
  data: {
    customerAddressDelete: {
      deletedAddressId: string;
      userErrors: Array<{
        field: string[];
        message: string;
      }>;
    };
  };
  variables: {
    addressId: string;
  };
};

