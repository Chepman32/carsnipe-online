import React, { useEffect, useState } from 'react';
import { list } from 'aws-amplify/storage';
import { Table, notification } from 'antd';

const MusicLibraryPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await list({
        path: 'public/photos/', // Specify your path here
        options: {
          pageSize: 20, // Optional: use pagination
        },
      });
      console.log("File list response:", response); // Log response to inspect structure

      // Check if response.items exists and is an array
      if (response && Array.isArray(response.items)) {
        setFiles(response.items);
      } else {
        console.error("Unexpected response structure:", response);
        setFiles([]); // Set empty array if response is unexpected
        notification.error({
          message: "Error",
          description: "No files found or failed to retrieve files",
        });
      }
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