/*
  # Initial Schema Setup

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `total_debt` (numeric, default 0)
      - `created_at` (timestamptz)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key to customers)
      - `amount` (numeric)
      - `items` (text)
      - `date` (timestamptz)
      - `type` (text, constrained to 'debt' or 'payment')
      - `created_at` (timestamptz)

  2. Constraints
    - Foreign key from transactions.customer_id to customers.id
    - Check constraint on transactions.type to ensure valid values
    - Default values for timestamps and IDs
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    total_debt numeric DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    items text NOT NULL,
    date timestamptz NOT NULL DEFAULT now(),
    type text NOT NULL CHECK (type IN ('debt', 'payment')),
    created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups of transactions by customer
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON customers
    FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Enable all access for authenticated users" ON transactions
    FOR ALL
    TO authenticated
    USING (true);