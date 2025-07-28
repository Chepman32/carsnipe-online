import React, { useEffect, useState } from 'react';
// AWS Amplify storage removed - implement with Supabase storage if needed
import { Table, notification } from 'antd';

const MusicLibraryPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // AWS Amplify storage removed - implement with Supabase storage if needed
      console.log("Music library loading disabled - needs Supabase storage implementation");
      setFiles([]);
      notification.info({
        message: "Info",
        description: "Music library feature requires Supabase storage implementation",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching files:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch files from S3",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'key',
      key: 'key',
      render: (text) => text.split('/').pop(),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size) => (size ? `${size} bytes` : 'Folder'),
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div>
      <h2>Music Library</h2>
      <Table
        dataSource={files}
        columns={columns}
        rowKey="key"
        loading={loading}
        pagination={{
          pageSize: 20,
          position: ["bottomCenter"],
        }}
      />
    </div>
  );
};

export default MusicLibraryPage;