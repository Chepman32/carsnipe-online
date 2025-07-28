import React from "react";
import { Typography, Empty } from "antd";
import { useParams } from "react-router-dom";
import "./UserPage.css";

const { Title } = Typography;

const UserPage = () => {
  const { userId } = useParams();

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Title level={2}>User Profile</Title>
      <Empty 
        description="User profile feature temporarily disabled during migration to Supabase"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </div>
  );
};

export default UserPage;