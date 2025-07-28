import React from "react";
import { Typography, Empty } from "antd";
import "./MessengerPage.css";

const { Title } = Typography;

const MessengerPage = () => {
  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Title level={2}>Messenger</Title>
      <Empty 
        description="Messenger feature temporarily disabled during migration to Supabase"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </div>
  );
};

export default MessengerPage;