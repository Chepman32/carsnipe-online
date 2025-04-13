import React from 'react';
import { Card, Typography, Button } from 'antd';
import { calculateTimeDifference, getImageSource } from '../../functions';

const { Title, Text } = Typography;

export default function CarItem({ car, onPurchase, currentMoney }) {
  const canAfford = currentMoney >= car.price;

  return (
    <Card
      hoverable
      cover={
        React.createElement(
          'img',
          {
            alt: `${car.year} ${car.make} ${car.model}`,
            src: typeof getImageSource === 'function' ? 
              (car && car.make && car.model ? 
                getImageSource(car.make, car.model) : '') : '',
            style: { height: '200px', objectFit: 'contain' },
            onError: (e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }
          }
        )
      }
    >
      <Title level={4}>{car.year} {car.make} {car.model}</Title>
      <Text type="secondary">{car.description}</Text>
      <div style={{ marginTop: '16px' }}>
        <Text strong>Price: ${car.price.toLocaleString()}</Text>
      </div>
      <Button
        type="primary"
        onClick={() => onPurchase(car)}
        disabled={!canAfford}
        style={{ marginTop: '16px', width: '100%' }}
      >
        {canAfford ? 'Purchase' : 'Insufficient Funds'}
      </Button>
    </Card>
  );
} 