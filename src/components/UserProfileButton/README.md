# UserProfileButton Component

A reusable button component that navigates to a user's profile page.

## Usage

```jsx
import UserProfileButton from '../components/UserProfileButton';

// Basic usage
<UserProfileButton userId="user-123" />

// Customized button
<UserProfileButton
  userId="user-123"
  buttonText="View Profile"
  tooltipText="Check out this user's profile"
  type="primary"
  size="large"
  style={{ marginTop: '10px' }}
  className="custom-button"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| userId | string | required | The ID of the user whose profile to open |
| buttonText | string | "Open user's profile" | Text to display on the button |
| tooltipText | string | "View this user's profile" | Text to display in the tooltip |
| type | string | "default" | Button type (primary, default, etc.) |
| size | string | "middle" | Button size (small, middle, large) |
| style | object | {} | Additional inline styles |
| className | string | "" | Additional CSS class names |
| showErrorMessage | boolean | true | Whether to show an error message if userId is invalid |

## Features

- Shows a loading state while navigating to the user's profile
- Displays an error message if the userId is missing (can be disabled)
- Disables the button if userId is not provided
- Shows a tooltip with an appropriate message based on whether userId is provided

## Example Implementation

Here's an example of how to use the UserProfileButton in an auction item component:

```jsx
import React from 'react';
import { Card, Typography } from 'antd';
import UserProfileButton from '../components/UserProfileButton';

const AuctionItem = ({ auction }) => {
  return (
    <Card title={auction.title}>
      <Typography.Paragraph>
        Seller: {auction.sellerName}
      </Typography.Paragraph>
      <Typography.Paragraph>
        Price: ${auction.price}
      </Typography.Paragraph>

      <UserProfileButton
        userId={auction.sellerId}
        buttonText="View Seller Profile"
        type="primary"
      />
    </Card>
  );
};

export default AuctionItem;
```

## Error Handling

The component handles several error cases:

1. If `userId` is not provided:
   - The button will be disabled
   - A tooltip will show "User ID is missing"
   - If clicked (which shouldn't happen due to being disabled), it will show an error message

2. If the user doesn't exist:
   - The button will navigate to the user page
   - The user page will display a "User Not Found" message