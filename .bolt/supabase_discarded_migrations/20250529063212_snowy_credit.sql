/*
  # Update RLS policies for customers table

  1. Changes
    - Drop existing ALL policy
    - Add separate policies for each operation type (SELECT, INSERT, UPDATE, DELETE)
    - Grant access to both authenticated and anon roles
  
  2. Security
    - Enable access for both authenticated and anon users
    - Maintain data integrity with proper policies
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON customers;

-- Create new policies for different operations
CREATE POLICY "Enable read access for all users" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON customers
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON customers
  FOR DELETE USING (true);

-- Drop existing policy on transactions
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON transactions;

-- Create new policies for transactions
CREATE POLICY "Enable read access for all users" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON transactions
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON transactions
  FOR DELETE USING (true);