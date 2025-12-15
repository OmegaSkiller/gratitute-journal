-- Create a unique index on entry_date and user_id to support upserts
ALTER TABLE public.entries ADD CONSTRAINT entries_user_id_entry_date_key UNIQUE (user_id, entry_date);

-- Set up Row Level Security (RLS) for the existing entries table
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view their own entries
CREATE POLICY "Users can view their own entries"
ON public.entries
FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own entries
CREATE POLICY "Users can insert their own entries"
ON public.entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own entries
CREATE POLICY "Users can update their own entries"
ON public.entries
FOR UPDATE
USING (auth.uid() = user_id);

-- Create a policy that allows users to delete their own entries
CREATE POLICY "Users can delete their own entries"
ON public.entries
FOR DELETE
USING (auth.uid() = user_id);
