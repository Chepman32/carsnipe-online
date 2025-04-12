import React from 'react';
import { Card, Typography, Button } from 'antd';
import { calculateTimeDifference } from '../../functions';

const { Title, Text } = Typography;

const getImageSource = (make, model) => {
  const imageName = `${make} ${model}.png`;
  return require(`../../assets/images/cars/${imageName}`);
};

export default function CarItem({ car, onPurchase, currentMoney }) {
  const canAfford = currentMoney >= car.price;

  return (
    <Card
      hoverable
      cover={
        <img
          alt={`${car.year} ${car.make} ${car.model}`}
          src={getImageSource(car.make, car.model)}
          style={{ height: '200px', objectFit: 'contain' }}
        />
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