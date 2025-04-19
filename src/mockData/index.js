export const mockAuctions = [
  {
    id: '1',
    make: 'Ferrari',
    model: '488 GTB',
    year: 2020,
    currentBid: 250000,
    minBid: 200000,
    buy: 300000,
    // Convert future date to Unix timestamp string (seconds)
    endTime: String(Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000)),
    status: 'Active',
    seller: 'demo-user',
    bids: []
  },
  {
    id: '2',
    make: 'Lamborghini',
    model: 'Huracan',
    year: 2021,
    currentBid: 280000,
    minBid: 250000,
    buy: 350000,
    // Convert future date to Unix timestamp string (seconds)
    endTime: String(Math.floor((Date.now() + 48 * 60 * 60 * 1000) / 1000)),
    status: 'Active',
    seller: 'demo-user',
    bids: []
  },
  {
    id: '3',
    make: 'Porsche',
    model: '911 Turbo S',
    year: 2022,
    currentBid: 220000,
    minBid: 200000,
    buy: 280000,
    // Convert future date to Unix timestamp string (seconds)
    endTime: String(Math.floor((Date.now() + 12 * 60 * 60 * 1000) / 1000)),
    status: 'Active',
    seller: 'demo-user',
    bids: []
  }
];

export const mockCars = [
  {
    id: '1',
    make: 'Ferrari',
    model: '488 GTB',
    year: 2020,
    price: 300000,
    description: 'Like new condition, low mileage',
    seller: 'demo-user'
  },
  {
    id: '2',
    make: 'Lamborghini',
    model: 'Huracan',
    year: 2021,
    price: 350000,
    description: 'Perfect condition, fully loaded',
    seller: 'demo-user'
  },
  {
    id: '3',
    make: 'Porsche',
    model: '911 Turbo S',
    year: 2022,
    price: 280000,
    description: 'Brand new, never driven',
    seller: 'demo-user'
  }
];

export const getMockAuctions = () => {
  const storedAuctions = localStorage.getItem('mockAuctions');
  return storedAuctions ? JSON.parse(storedAuctions) : mockAuctions;
};

export const getMockCars = () => {
  const storedCars = localStorage.getItem('mockCars');
  return storedCars ? JSON.parse(storedCars) : mockCars;
};

export const updateMockAuctions = (auctions) => {
  localStorage.setItem('mockAuctions', JSON.stringify(auctions));
};

export const updateMockCars = (cars) => {
  localStorage.setItem('mockCars', JSON.stringify(cars));
};
