import React from "react";
import { Typography, Empty } from "antd";

const { Title } = Typography;

export default function MyBids({ playerInfo, setMoney, money }) {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>My Bids</Title>
      <Empty 
        description="Feature temporarily disabled during migration to Supabase"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </div>
  );
}