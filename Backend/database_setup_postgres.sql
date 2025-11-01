-- PostgreSQL Database Setup for Movie Recommender
-- This file creates all necessary tables for the movie recommendation system

-- Account table (users)
CREATE TABLE IF NOT EXISTS account (
    account_id SERIAL PRIMARY KEY,
    login_name VARCHAR(50) NOT NULL UNIQUE,
    login_password_hash VARCHAR(200) NOT NULL,
    password_recovery_expires DATE DEFAULT NULL,
    password_recovery_hash VARCHAR(200) DEFAULT NULL,
    email_address VARCHAR(200) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    bio TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    tmdb_id INTEGER NOT NULL UNIQUE,
    imdb_id VARCHAR(20) DEFAULT NULL,
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500) DEFAULT NULL,
    year INTEGER DEFAULT NULL,
    release_date DATE DEFAULT NULL,
    tmdb_rating DECIMAL(3,1) DEFAULT NULL,
    tmdb_vote_count INTEGER DEFAULT NULL,
    imdb_rating DECIMAL(3,1) DEFAULT NULL,
    genres JSONB DEFAULT NULL,
    runtime_minutes INTEGER DEFAULT NULL,
    overview TEXT DEFAULT NULL,
    tagline VARCHAR(1000) DEFAULT NULL,
    poster_path VARCHAR(500) DEFAULT NULL,
    poster_url VARCHAR(1000) DEFAULT NULL,
    backdrop_path VARCHAR(500) DEFAULT NULL,
    backdrop_url VARCHAR(1000) DEFAULT NULL,
    original_language VARCHAR(10) DEFAULT NULL,
    spoken_languages JSONB DEFAULT NULL,
    production_countries JSONB DEFAULT NULL,
    director VARCHAR(500) DEFAULT NULL,
    cast_main JSONB DEFAULT NULL,
    budget BIGINT DEFAULT NULL,
    revenue BIGINT DEFAULT NULL,
    popularity DECIMAL(8,3) DEFAULT NULL,
    adult BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User movie interactions (likes/dislikes)
CREATE TABLE IF NOT EXISTS user_movie_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    interaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES account(account_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE(user_id, movie_id)
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    preferred_genres JSONB DEFAULT NULL,
    min_rating DECIMAL(3,1) DEFAULT 0.0,
    max_rating DECIMAL(3,1) DEFAULT 10.0,
    min_year INTEGER DEFAULT 1900,
    max_year INTEGER DEFAULT 2030,
    min_runtime INTEGER DEFAULT 0,
    max_runtime INTEGER DEFAULT 300,
    preferred_languages JSONB DEFAULT NULL,
    exclude_adult BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES account(account_id) ON DELETE CASCADE
);

-- User watchlist
CREATE TABLE IF NOT EXISTS user_watchlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES account(account_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE(user_id, movie_id)
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'hu',
    email_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES account(account_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_rating ON movies(tmdb_rating);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_movie_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_movie_id ON user_movie_interactions(movie_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON user_preferences(user_id);