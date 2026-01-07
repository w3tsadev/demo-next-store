// Customer Account API Queries

export const getCustomerQuery = /* GraphQL */ `
  query getCustomer {
    customer {
    firstName
    lastName
    emailAddress {
      emailAddress
      }
    }
  }
`;

export const getCustomerOrdersQuery = /* GraphQL */ `
  query getCustomerOrders($first: Int = 10, $after: String) {
    customer {
      orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            number
            name
            processedAt
            financialStatus
            fulfillments(first: 1) {
              edges {
                node {
                  status
                }
              }
            }
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

export const getCustomerAddressesQuery = /* GraphQL */ `
  query getCustomerAddresses {
    customer {
      addresses(first: 20) {
        edges {
          node {
            id
            address1
            address2
            city
            company
            country
            countryCodeV2
            firstName
            lastName
            phone
            province
            provinceCode
            zip
          }
        }
      }
    }
  }
`;

