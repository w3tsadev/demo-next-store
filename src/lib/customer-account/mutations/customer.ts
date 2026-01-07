// Customer Account API Mutations

export const customerUpdateMutation = /* GraphQL */ `
  mutation customerUpdate($customer: CustomerUpdateInput!) {
    customerUpdate(input: $customer) {
      customer {
        id
        firstName
        lastName
        displayName
        email
        phone
        createdAt
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const customerAddressCreateMutation = /* GraphQL */ `
  mutation customerAddressCreate($address: CustomerAddressInput!) {
    customerAddressCreate(address: $address) {
      customerAddress {
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
      userErrors {
        field
        message
      }
    }
  }
`;

export const customerAddressUpdateMutation = /* GraphQL */ `
  mutation customerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!) {
    customerAddressUpdate(addressId: $addressId, address: $address) {
      customerAddress {
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
      userErrors {
        field
        message
      }
    }
  }
`;

export const customerAddressDeleteMutation = /* GraphQL */ `
  mutation customerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        field
        message
      }
    }
  }
`;

