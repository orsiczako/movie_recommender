-- Database setup script for Film Ajánló Rendszer (Movie Recommendation System)
-- Run this with: mysql -u root -p < database_setup.sql

-- Create database with Hungarian collation
CREATE DATABASE IF NOT EXISTS projekt DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;

-- Use the database
USE projekt;

-- =============================================================================
-- 1. ACCOUNT TABLE - Felhasználói fiókok / User Accounts
-- =============================================================================
CREATE TABLE `account` (
    `account_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Account identifier',
    `login_name` VARCHAR(50) NOT NULL COMMENT 'Name used for login',
    `login_password_hash` VARCHAR(200) NOT NULL COMMENT 'Hash for the account password',
    `password_recovery_expires` DATE DEFAULT NULL COMMENT 'The recovery code can not be used beyond this date',
    `password_recovery_hash` VARCHAR(200) DEFAULT NULL COMMENT 'The hash of the last sent recovery code',
    `email_address` VARCHAR(200) NOT NULL COMMENT 'User email address',
    `full_name` VARCHAR(200) NOT NULL COMMENT 'Full name for the user',
    `bio` TEXT DEFAULT NULL COMMENT 'User biography',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    PRIMARY KEY (`account_id`),
    UNIQUE KEY `account_id_UNIQUE` (`account_id`),
    UNIQUE KEY `login_name_UNIQUE` (`login_name`),
    UNIQUE KEY `email_address_UNIQUE` (`email_address`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='User accounts for movie recommendation system';

-- =============================================================================
-- 2. MOVIES TABLE - Filmek adatai / Movie Data (TMDB API integration)
-- =============================================================================
CREATE TABLE `movies` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Internal movie ID',
    `tmdb_id` INT NOT NULL COMMENT 'TMDB API movie ID',
    `imdb_id` VARCHAR(20) DEFAULT NULL COMMENT 'IMDB movie ID',
    `title` VARCHAR(500) NOT NULL COMMENT 'Movie title',
    `original_title` VARCHAR(500) DEFAULT NULL COMMENT 'Original movie title',
    `year` INT DEFAULT NULL COMMENT 'Release year',
    `release_date` DATE DEFAULT NULL COMMENT 'Exact release date',
    `tmdb_rating` DECIMAL(3,1) DEFAULT NULL COMMENT 'TMDB rating (0.0-10.0)',
    `tmdb_vote_count` INT DEFAULT NULL COMMENT 'Number of TMDB votes',
    `imdb_rating` DECIMAL(3,1) DEFAULT NULL COMMENT 'IMDB rating (0.0-10.0)',
    `genres` JSON DEFAULT NULL COMMENT 'Movie genres as JSON array',
    `runtime_minutes` INT DEFAULT NULL COMMENT 'Runtime in minutes',
    `overview` TEXT DEFAULT NULL COMMENT 'Movie plot overview',
    `tagline` VARCHAR(1000) DEFAULT NULL COMMENT 'Movie tagline',
    `poster_path` VARCHAR(500) DEFAULT NULL COMMENT 'TMDB poster path',
    `poster_url` VARCHAR(1000) DEFAULT NULL COMMENT 'Full poster URL',
    `backdrop_path` VARCHAR(500) DEFAULT NULL COMMENT 'TMDB backdrop path',
    `backdrop_url` VARCHAR(1000) DEFAULT NULL COMMENT 'Full backdrop URL',
    `original_language` VARCHAR(10) DEFAULT NULL COMMENT 'Original language code',
    `spoken_languages` JSON DEFAULT NULL COMMENT 'Spoken languages as JSON',
    `production_countries` JSON DEFAULT NULL COMMENT 'Production countries as JSON',
    `director` VARCHAR(500) DEFAULT NULL COMMENT 'Movie director',
    `cast_main` JSON DEFAULT NULL COMMENT 'Main cast as JSON array',
    `budget` BIGINT DEFAULT NULL COMMENT 'Movie budget in USD',
    `revenue` BIGINT DEFAULT NULL COMMENT 'Movie revenue in USD',
    `popularity` DECIMAL(8,3) DEFAULT NULL COMMENT 'TMDB popularity score',
    `adult` TINYINT(1) DEFAULT 0 COMMENT 'Adult content flag',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    PRIMARY KEY (`id`),
    UNIQUE KEY `tmdb_id_UNIQUE` (`tmdb_id`),
    KEY `idx_year` (`year`),
    KEY `idx_rating` (`tmdb_rating`),
    KEY `idx_popularity` (`popularity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Movie data from TMDB API';

-- =============================================================================
-- 3. USER_PREFERENCES TABLE - Felhasználói preferenciák / User Preferences
-- =============================================================================
CREATE TABLE `user_preferences` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Preference record ID',
    `user_id` INT UNSIGNED NOT NULL COMMENT 'Foreign key to account.account_id',
    
    -- Műfaj preferenciák / Genre Preferences
    `genre_action` TINYINT(1) DEFAULT NULL COMMENT 'Action genre preference',
    `genre_adventure` TINYINT(1) DEFAULT NULL COMMENT 'Adventure genre preference',
    `genre_animation` TINYINT(1) DEFAULT NULL COMMENT 'Animation genre preference',
    `genre_comedy` TINYINT(1) DEFAULT NULL COMMENT 'Comedy genre preference',
    `genre_crime` TINYINT(1) DEFAULT NULL COMMENT 'Crime genre preference',
    `genre_documentary` TINYINT(1) DEFAULT NULL COMMENT 'Documentary genre preference',
    `genre_drama` TINYINT(1) DEFAULT NULL COMMENT 'Drama genre preference',
    `genre_family` TINYINT(1) DEFAULT NULL COMMENT 'Family genre preference',
    `genre_fantasy` TINYINT(1) DEFAULT NULL COMMENT 'Fantasy genre preference',
    `genre_history` TINYINT(1) DEFAULT NULL COMMENT 'History genre preference',
    `genre_horror` TINYINT(1) DEFAULT NULL COMMENT 'Horror genre preference',
    `genre_music` TINYINT(1) DEFAULT NULL COMMENT 'Music genre preference',
    `genre_mystery` TINYINT(1) DEFAULT NULL COMMENT 'Mystery genre preference',
    `genre_romance` TINYINT(1) DEFAULT NULL COMMENT 'Romance genre preference',
    `genre_science_fiction` TINYINT(1) DEFAULT NULL COMMENT 'Sci-Fi genre preference',
    `genre_thriller` TINYINT(1) DEFAULT NULL COMMENT 'Thriller genre preference',
    `genre_war` TINYINT(1) DEFAULT NULL COMMENT 'War genre preference',
    `genre_western` TINYINT(1) DEFAULT NULL COMMENT 'Western genre preference',
    `genre_anime` TINYINT(1) DEFAULT NULL COMMENT 'Anime genre preference',
    
    -- Egyéb preferenciák / Other Preferences
    `min_year` INT DEFAULT 1900 COMMENT 'Minimum release year',
    `max_year` INT DEFAULT YEAR(CURDATE()) COMMENT 'Maximum release year',
    `min_rating` DECIMAL(3,1) DEFAULT 0.0 COMMENT 'Minimum acceptable rating',
    `runtime_preference` ENUM('short','medium','long','any') DEFAULT 'any' COMMENT 'Runtime preference',
    `preferred_languages` JSON DEFAULT NULL COMMENT 'Preferred languages as JSON array',
    `prefer_classic` TINYINT(1) DEFAULT 0 COMMENT 'Prefer classic movies',
    `prefer_modern` TINYINT(1) DEFAULT 1 COMMENT 'Prefer modern movies',
    `prefer_recent` TINYINT(1) DEFAULT 1 COMMENT 'Prefer recent movies',
    `child_mode` TINYINT(1) DEFAULT 0 COMMENT 'Child-safe mode enabled',
    
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Preferences creation timestamp',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_id_UNIQUE` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `account`(`account_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User movie preferences for recommendations';

-- =============================================================================
-- 4. SETTINGS TABLE - Alkalmazás beállítások / Application Settings
-- =============================================================================
CREATE TABLE `settings` (
    `user_id` INT UNSIGNED NOT NULL COMMENT 'Foreign key to account.account_id (also PK)',
    
    -- Általános beállítások / General Settings
    `language` VARCHAR(8) NOT NULL DEFAULT 'hu' COMMENT 'Interface language: hu or en',
    `theme` VARCHAR(20) DEFAULT 'light' COMMENT 'UI theme: light or dark',
    
    -- Alkalmazás beállítások / Application Settings
    `auto_save_interval` INT DEFAULT 60 COMMENT 'Auto save interval in seconds (0=disabled)',
    `results_per_page` INT DEFAULT 25 COMMENT 'Number of results to display per page',
    `animation_speed` VARCHAR(20) DEFAULT 'normal' COMMENT 'Animation speed: slow, normal, fast, off',
    
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Settings creation timestamp',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    
    PRIMARY KEY (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `account`(`account_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User application settings';

-- =============================================================================
-- 5. USER_MOVIE_INTERACTIONS TABLE - Felhasználói filmekkel való interakciók / User-Movie Interactions
-- =============================================================================
CREATE TABLE `user_movie_interactions` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Interaction record ID',
    `user_id` INT UNSIGNED NOT NULL COMMENT 'Foreign key to account.account_id',
    `movie_id` INT NOT NULL COMMENT 'Foreign key to movies.id',
    `interaction_type` ENUM('LIKE','DISLIKE') NOT NULL COMMENT 'Type of interaction (swipe result)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Interaction timestamp',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_movie_unique` (`user_id`, `movie_id`),
    KEY `idx_user_interactions` (`user_id`, `interaction_type`),
    KEY `idx_movie_interactions` (`movie_id`, `interaction_type`),
    FOREIGN KEY (`user_id`) REFERENCES `account`(`account_id`) ON DELETE CASCADE,
    FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User swipe interactions with movies (Tinder-like)';

-- =============================================================================
-- 6. USER_WATCHLIST TABLE - Felhasználói figyelőlista / User Watchlist
-- =============================================================================
CREATE TABLE `user_watchlist` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Watchlist record ID',
    `user_id` INT UNSIGNED NOT NULL COMMENT 'Foreign key to account.account_id',
    `movie_id` INT NOT NULL COMMENT 'Foreign key to movies.id',
    `watched` TINYINT(1) DEFAULT 0 COMMENT 'Whether user has watched this movie',
    `user_rating` DECIMAL(3,1) DEFAULT NULL COMMENT 'User personal rating (0.0-10.0)',
    `added_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When added to watchlist',
    `watched_at` DATETIME DEFAULT NULL COMMENT 'When marked as watched',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_movie_watchlist_unique` (`user_id`, `movie_id`),
    KEY `idx_user_watchlist` (`user_id`, `watched`),
    KEY `idx_added_at` (`added_at`),
    FOREIGN KEY (`user_id`) REFERENCES `account`(`account_id`) ON DELETE CASCADE,
    FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User movie watchlist and watch history';

-- =============================================================================
-- INDEXEK ÉS OPTIMALIZÁCIÓ / INDEXES AND OPTIMIZATION
-- =============================================================================

-- Additional indexes for better performance
CREATE INDEX `idx_movies_year_rating` ON `movies`(`year`, `tmdb_rating`);
CREATE INDEX `idx_interactions_created` ON `user_movie_interactions`(`created_at`);
CREATE INDEX `idx_watchlist_watched_at` ON `user_watchlist`(`watched_at`);

SHOW TABLES;

-- Display table structures
DESCRIBE account;
DESCRIBE movies;
DESCRIBE user_preferences;
DESCRIBE settings;
DESCRIBE user_movie_interactions;
DESCRIBE user_watchlist;

-- Show foreign key relationships
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'projekt'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Display success message
SELECT 'Film Ajánló Rendszer adatbázis sikeresen létrehozva!' AS Status;
SELECT 'Database setup completed successfully!' AS Status_EN;