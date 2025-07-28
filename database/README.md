# Carsnipe Database Setup

This directory contains all SQL scripts needed to set up the Carsnipe database in Supabase.

## 📋 Setup Order

Run these scripts **in order** in your Supabase SQL Editor:

### 1. `01_schema.sql` - Core Database Schema
- Creates all tables (users, cars, auctions, etc.)
- Sets up foreign key relationships
- **Run this first!**

### 2. `02_indexes.sql` - Performance Indexes
- Adds database indexes for fast queries
- Improves performance for common operations

### 3. `03_rls_policies.sql` - Security Policies
- Enables Row Level Security (RLS)
- Creates authentication-based access policies
- Ensures data security

### 4. `04_sample_data.sql` - Test Data (Optional)
- Adds sample cars and auctions for testing
- Useful for development and demos
- Skip this in production

### 5. `05_realtime_setup.sql` - Live Features (Optional)
- Enables real-time subscriptions
- Sets up automatic timestamp updates
- Required for live bidding and chat

## 🚀 Quick Setup

1. Go to your Supabase project: https://supabase.com/dashboard/project/awgnuahtsxfzjtzupccq
2. Click **"SQL Editor"** → **"New Query"**
3. Copy and paste each file's content in order
4. Click **"Run"** for each script

## ✅ Verification

After running all scripts, you should see:
- **10 tables** in Database → Tables
- **Sample data** in the cars and auctions tables (if you ran script 4)
- **No errors** in the SQL Editor

## 🔧 Troubleshooting

- If you get **permission errors**: Check that RLS policies are set up correctly
- If you get **missing table errors**: Make sure you ran `01_schema.sql` first
- If you get **UUID errors**: The uuid-ossp extension should be enabled automatically

## 📁 File Structure

```
database/
├── 01_schema.sql          # Core tables and relationships
├── 02_indexes.sql         # Performance optimization
├── 03_rls_policies.sql    # Security and access control
├── 04_sample_data.sql     # Test data (optional)
├── 05_realtime_setup.sql  # Real-time features (optional)
└── README.md              # This file
```

## 🔄 Migration Notes

This database schema is designed to replace AWS Amplify GraphQL with Supabase PostgreSQL:

- **DynamoDB** → **PostgreSQL tables**
- **GraphQL resolvers** → **Supabase API**
- **Amplify Auth** → **Supabase Auth**
- **AppSync subscriptions** → **Supabase Realtime**

All field names use `snake_case` (PostgreSQL convention) but the application layer maps them to `camelCase` for compatibility.