-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS customers;

-- Create customers table
CREATE TABLE customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    total_debt numeric DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    items text NOT NULL,
    date timestamptz NOT NULL DEFAULT now(),
    type text NOT NULL CHECK (type IN ('debt', 'payment')),
    created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable all access for authenticated users"
ON customers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users"
ON transactions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);