import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'antd';
import 'antd/dist/reset.css';
import './achievementList.css';
import goals from "../../assets/images/achievements/goals.png";
import starter from "../../assets/images/achievements/debt.png";
import quick from "../../assets/images/achievements/flash.png";
import collector from "../../assets/images/achievements/delivery-truck.png";
import { fetchUserAchievementsList, getAchievementImageSource } from '../../functions'; // Import your achievement fetching function

const achievements = [
  { title: "First One", description: "Place your first bid." },
  { title: "First Win", description: "Win your first auction.", image: goals },
  { title: "Starter Pack", description: "Own 3 cars.", image: starter },
  { title: "Quick Sale", description: "Sell your first car.", image: quick },
  { title: "New Collector", description: "Collect 5 cars.", image: collector },
  { title: "Fast Mover", description: "Place a bid within 10 seconds of an auction starting." },
  { title: "Lucky Winner", description: "Win a car with no competition in bidding." },
  { title: "First Profit", description: "Sell a car for more than you paid." },
  { title: "Early Bird", description: "Be the first to bid in 5 different auctions." },
  { title: "Bargain Hunter", description: "Win a car for at least 10% below its market value." },
  { title: "Mid-Range Collector", description: "Own 10 cars." },
  { title: "Profit Dealer", description: "Sell 5 cars at a profit." },
  { title: "Bidding Battle", description: "Participate in an auction with 10 or more bids." },
  { title: "Auction Veteran", description: "Participate in 20 auctions." },
  { title: "High Roller", description: "Place a bid of over 100,000 credits." },
  { title: "Sniper", description: "Win an auction by bidding in the last 5 seconds." },
  { title: "Smooth Seller", description: "Sell 10 cars." },
  { title: "Day Trader", description: "Buy and sell a car in the same day." },
  { title: "Long Game", description: "Place a bid at least 24 hours before winning an auction." },
  { title: "Win Streak", description: "Win 5 auctions in a row." },
  { title: "Big Spender", description: "Spend over 500,000 credits in total." },
  { title: "Savvy Investor", description: "Earn 50,000 credits in profit from car sales." },
  { title: "Frequent Bidder", description: "Place bids in 50 different auctions." },
  { title: "Collector's Dream", description: "Own 15 cars." },
  { title: "Silver Dealer", description: "Sell 10 cars for profit." },
  { title: "Speedy Purchase", description: "Buy a car within 1 minute of an auction starting." },
  { title: "Big Time", description: "Participate in an auction with 20 or more bids." },
  { title: "Persistent", description: "Place 5 bids in the same auction." },
  { title: "Flipping Master", description: "Sell 10 cars in under 24 hours." },
  { title: "Collector King", description: "Own 20 cars." },
  { title: "Gold Dealer", description: "Sell 15 cars at a profit." },
  { title: "Auction Addict", description: "Participate in 50 auctions." },
  { title: "The Closer", description: "Win an auction in the last second." },
  { title: "High Stakes", description: "Place a bid of over 200,000 credits." },
  { title: "Experienced", description: "Win 10 auctions." },
  { title: "Lucky Strike", description: "Win 3 auctions in a row." },
  { title: "Money Maker", description: "Earn 100,000 credits in profit from car sales." },
  { title: "Elite Collector", description: "Own 25 cars." },
  { title: "Quick Bid", description: "Place a bid within 5 seconds of the auction start." },
  { title: "Snipe Master", description: "Win 5 auctions by bidding in the last 5 seconds." },
  { title: "Ultimate Collector", description: "Own 30 cars." },
  { title: "Whale Bidder", description: "Place a bid of over 500,000 credits." },
  { title: "Rookie", description: "Participate in your first auction." },
  { title: "Intermediate Bidder", description: "Place bids in 25 different auctions." },
  { title: "Master Seller", description: "Sell 20 cars." },
  { title: "Power Player", description: "Win 20 auctions." },
  { title: "Auction Champ", description: "Participate in 100 auctions." },
  { title: "Wealthy Trader", description: "Make 1,000,000 credits in profit from sales." },
  { title: "Billionaire", description: "Earn a total of 10,000,000 credits." },
  { title: "Grand Collector", description: "Own 50 cars." },
  { title: "Risk Taker", description: "Place a bid in an auction with 50 bids." },
  { title: "Pro Seller", description: "Sell 50 cars." },
  { title: "Market Dominator", description: "Sell 100 cars at a profit." },
  { title: "Flash Bidder", description: "Place a bid within 1 second of an auction start." },
  { title: "Insane Collector", description: "Own 100 cars." },
  { title: "Legendary Collector", description: "Own 200 cars." },
  { title: "Bid War Veteran", description: "Participate in 200 auctions." },
  { title: "Profit Guru", description: "Sell 200 cars for a profit." },
  { title: "Bidder's Bounty", description: "Place bids in 500 different auctions." },
  { title: "True Trader", description: "Buy and sell 50 cars." },
  { title: "Legendary Trader", description: "Buy and sell 100 cars." },
  { title: "Auctioneer", description: "Host your own auction." },
  { title: "Master Auctioneer", description: "Host 10 successful auctions." },
  { title: "Quick Hand", description: "Sell a car within 10 minutes of purchasing it." },
  { title: "Speed Trader", description: "Sell a car within 5 minutes of purchasing it." },
  { title: "Patience Pays", description: "Win an auction that lasted over 48 hours." },
  { title: "Tough Competition", description: "Win an auction with over 100 bids." },
  { title: "Fearless Bidder", description: "Place the first bid in an auction with over 100,000 credits." },
  { title: "Risky Business", description: "Win an auction with a bid 10% over market value." },
  { title: "Discount Dealer", description: "Buy a car for 20% below market value." },
  { title: "Bidding Frenzy", description: "Place 20 bids in one auction." },
  { title: "Midnight Sniper", description: "Win an auction by bidding in the last 5 seconds between midnight and 3am." },
  { title: "Weekend Warrior", description: "Win 5 auctions over the weekend." },
  { title: "Collector’s Paradise", description: "Own 75 cars." },
  { title: "The Finisher", description: "Win an auction with the last bid after 50 bids." },
  { title: "No Competition", description: "Win an auction with only your bid placed." },
  { title: "Loyal Bidder", description: "Place bids in 10 consecutive auctions." },
  { title: "Wealthy Collector", description: "Own 150 cars." },
  { title: "Iron Streak", description: "Win 10 auctions in a row." },
  { title: "Surprise Win", description: "Win an auction when you didn't bid for the last 30 minutes." },
  { title: "Lucky Profit", description: "Sell a car for double the purchase price." },
  { title: "Generous Bidder", description: "Place a bid 30% over the current highest bid." },
  { title: "Collector Supreme", description: "Own 300 cars." },
  { title: "Auction Marathon", description: "Participate in an auction that lasted over 72 hours." },
  { title: "Collector’s Dreamland", description: "Own 500 cars." },
  { title: "Bidding Machine", description: "Place bids in 1,000 auctions." },
  { title: "Profit Magnate", description: "Earn 10,000,000 credits in profit from car sales." },
  { title: "Sniping Streak", description: "Win 5 auctions by bidding in the last second." },
  { title: "Impossible Win", description: "Win an auction after not bidding for 24 hours." },
  { title: "Flash Collector", description: "Buy 5 cars within 24 hours." },
  { title: "Collector’s Journey", description: "Own 1,000 cars." },
  { title: "The Ultimate Dealer", description: "Sell 1,000 cars at a profit." },
  { title: "Grand Auctioneer", description: "Host 50 successful auctions." },
  { title: "Instant Profit", description: "Sell a car for a profit within 5 minutes of purchase." }
];

const AchievementList = ({ userId }) => {
  const [hovered, setHovered] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const achievementsList = await fetchUserAchievementsList(userId);
        setUserAchievements(achievementsList);
      } catch (error) {
        console.error("Error fetching user achievements:", error);
      }
    };
    fetchAchievements();
  }, [userId]);

  const userHasAchievement = (title) => {
    return userAchievements.some(achievement => achievement.name === title);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]}>
        {achievements.map((achievement, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <div
              className="achievement-card"
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <Card
                hoverable
                cover={
                  <div className="card-cover">
                    <img
                      alt={achievement.title}
                      src={
                        userHasAchievement(achievement.title)
                          ? getAchievementImageSource(achievement.title) || "https://cdn-icons-png.freepik.com/512/4387/4387887.png"
                          : "https://static.thenounproject.com/png/426780-200.png"
                      }
                      className="card-image"
                    />
                    {hovered === index && (
                      <div className="overlay">
                        <div className="overlay-text">{achievement.description}</div>
                      </div>
                    )}
                  </div>
                }
                style={{ textAlign: 'center', width: '100%', height: '100%' }}
              >
                <h3>{achievement.title}</h3>
              </Card>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AchievementList;