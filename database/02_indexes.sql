-- Database Indexes for Performance
-- Run this after creating the schema

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_cars_user_id ON user_cars(user_id);
CREATE INDEX idx_user_cars_car_id ON user_cars(car_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_end_time ON auctions(end_time);
CREATE INDEX idx_auction_users_user_id ON auction_users(user_id);
CREATE INDEX idx_auction_users_auction_id ON auction_users(auction_id);
CREATE INDEX idx_bid_info_user_id ON bid_info(user_id);
CREATE INDEX idx_bid_info_auction_id ON bid_info(auction_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_user_conversations_user_id ON user_conversations(user_id);
CREATE INDEX idx_user_conversations_conversation_id ON user_conversations(conversation_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);