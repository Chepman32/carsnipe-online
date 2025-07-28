-- Sample Data for Testing
-- Run this after setting up schema, indexes, and RLS policies

-- Insert sample cars with different types and price ranges
INSERT INTO cars (make, model, year, price, type) VALUES
('Toyota', 'Camry', 2022, 35000, 'COMMON'),
('Honda', 'Civic', 2022, 28000, 'COMMON'),
('Ford', 'Focus', 2021, 25000, 'COMMON'),
('Mazda', 'MX-5', 2020, 32000, 'COMMON'),
('Volkswagen', 'Golf GTI', 2021, 38000, 'COMMON'),
('Hyundai', 'Elantra', 2022, 26000, 'COMMON'),
('Nissan', 'Altima', 2023, 30000, 'COMMON'),
('Kia', 'Forte', 2022, 24000, 'COMMON'),

-- Rare cars (mid-tier)
('BMW', '3 Series', 2021, 45000, 'RARE'),
('Audi', 'A4', 2022, 48000, 'RARE'),
('Mercedes-Benz', 'C-Class', 2021, 52000, 'RARE'),
('Chevrolet', 'Corvette C8', 2022, 80000, 'RARE'),
('Porsche', 'Cayman', 2020, 75000, 'RARE'),
('Infiniti', 'Q50', 2022, 42000, 'RARE'),

-- Epic cars (high-tier)
('BMW', 'M3', 2022, 85000, 'EPIC'),
('Audi', 'RS5', 2021, 95000, 'EPIC'),
('Mercedes-AMG', 'C63', 2022, 98000, 'EPIC'),
('Porsche', '911 Carrera', 2021, 120000, 'EPIC'),
('Jaguar', 'F-Type', 2020, 89000, 'EPIC'),

-- Legendary cars (ultra high-tier)
('Ferrari', '488 GTB', 2020, 300000, 'LEGENDARY'),
('Lamborghini', 'Huracán', 2021, 250000, 'LEGENDARY'),
('McLaren', '570S', 2020, 220000, 'LEGENDARY'),
('Aston Martin', 'Vantage', 2021, 180000, 'LEGENDARY'),
('Porsche', '911 Turbo S', 2022, 230000, 'LEGENDARY'),
('Ferrari', 'F8 Tributo', 2021, 350000, 'LEGENDARY'),
('Lamborghini', 'Aventador', 2020, 400000, 'LEGENDARY');

-- Sample auctions (you can modify these as needed)
INSERT INTO auctions (make, model, year, car_id, current_bid, end_time, status, player, buy, min_bid, type, bids_count) VALUES
('Toyota', 'Camry', 2022, (SELECT id FROM cars WHERE make = 'Toyota' AND model = 'Camry' LIMIT 1), 30000, (EXTRACT(epoch FROM NOW() + INTERVAL '1 hour'))::text, 'Active', 'Demo Player', 35000, 25000, 'COMMON', 3),
('BMW', '3 Series', 2021, (SELECT id FROM cars WHERE make = 'BMW' AND model = '3 Series' LIMIT 1), 40000, (EXTRACT(epoch FROM NOW() + INTERVAL '2 hours'))::text, 'Active', 'Demo Player', 45000, 35000, 'RARE', 5),
('Ferrari', '488 GTB', 2020, (SELECT id FROM cars WHERE make = 'Ferrari' AND model = '488 GTB' LIMIT 1), 250000, (EXTRACT(epoch FROM NOW() + INTERVAL '3 hours'))::text, 'Active', 'Demo Player', 300000, 200000, 'LEGENDARY', 8);