/*
  # Fix RLS policies for customers table

  1. Changes
    - Drop existing RLS policy for customers table
    - Create new RLS policy that properly handles all operations including INSERT
  
  2. Security
    - Enable RLS on customers table (already enabled)
    - Add comprehensive policy for authenticated users
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON customers;

-- Create new comprehensive policy
CREATE POLICY "Enable all access for authenticated users"
ON customers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);