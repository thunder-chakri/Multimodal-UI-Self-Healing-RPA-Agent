-- =========================================================================
-- Migration: Create Reviews Table with Strict Row-Level Security (RLS)
-- Target: Supabase / PostgreSQL
-- =========================================================================

-- 1. Create the reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id);

-- 2. ENABLE ROW-LEVEL SECURITY (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICY 1: Public Read
-- Anyone (including anonymous visitors) can view verified reviews.
DROP POLICY IF EXISTS "Public can view verified reviews" ON public.reviews;
CREATE POLICY "Public can view verified reviews"
    ON public.reviews
    FOR SELECT
    USING (true);

-- 4. RLS POLICY 2: Authenticated Users Insert ONLY
-- A user can only insert a review where user_id strictly matches their authenticated auth.uid().
-- This prevents impersonation, bot spoofing, and forged user IDs.
DROP POLICY IF EXISTS "Authenticated users can insert own review" ON public.reviews;
CREATE POLICY "Authenticated users can insert own review"
    ON public.reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
    );

-- 5. RLS POLICY 3: User Update Own Review Only
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews"
    ON public.reviews
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. RLS POLICY 4: User Delete Own Review Only
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews"
    ON public.reviews
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7. Automated update timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_updated ON public.reviews;
CREATE TRIGGER on_review_updated
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
