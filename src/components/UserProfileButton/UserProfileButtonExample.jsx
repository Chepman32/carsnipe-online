import React, { useState } from 'react';
import { Card, Input, Space, Typography, Divider, Radio } from 'antd';
import UserProfileButton from './UserProfileButton';

/**
 * Example component to demonstrate the UserProfileButton
 */
const UserProfileButtonExample = () => {
  const [userId, setUserId] = useState('');
  const [buttonType, setButtonType] = useState('default');
  const [buttonSize, setButtonSize] = useState('middle');

  return (
    <Card title="UserProfileButton Example" style={{ maxWidth: 600, margin: '20px auto' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Title level={4}>Configure the Button</Typography.Title>
        
        <Typography.Text strong>User ID:</Typography.Text>
        <Input 
          placeholder="Enter a user ID" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        
        <Typography.Text strong>Button Type:</Typography.Text>
        <Radio.Group 
          value={buttonType} 
          onChange={(e) => setButtonType(e.target.value)}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="default">Default</Radio.Button>
          <Radio.Button value="primary">Primary</Radio.Button>
          <Radio.Button value="dashed">Dashed</Radio.Button>
          <Radio.Button value="link">Link</Radio.Button>
        </Radio.Group>
        
        <Typography.Text strong>Button Size:</Typography.Text>
        <Radio.Group 
          value={buttonSize} 
          onChange={(e) => setButtonSize(e.target.value)}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="small">Small</Radio.Button>
          <Radio.Button value="middle">Middle</Radio.Button>
          <Radio.Button value="large">Large</Radio.Button>
        </Radio.Group>
        
        <Divider />
        
        <Typography.Title level={4}>Result</Typography.Title>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
          <UserProfileButton 
            userId={userId}
            buttonText="View User Profile"
            type={buttonType}
            size={buttonSize}
          />
        </div>
        
        <Typography.Paragraph type="secondary">
          Try entering different user IDs or leaving it blank to see how the button handles different cases.
        </Typography.Paragraph>
      </Space>
    </Card>
  );
};

export default UserProfileButtonExample;