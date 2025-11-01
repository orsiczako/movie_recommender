CREATE DATABASE IF NOT EXISTS projekt DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;

USE projekt;

CREATE TABLE `account` (
    `account_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `login_name` VARCHAR(50) NOT NULL,
    `login_password_hash` VARCHAR(200) NOT NULL,
    `password_recovery_expires` DATE DEFAULT NULL,
    `password_recovery_hash` VARCHAR(200) DEFAULT NULL,
    `email_address` VARCHAR(200) NOT NULL,
    `full_name` VARCHAR(200) NOT NULL,
    `bio` TEXT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`account_id`),
    UNIQUE KEY `account_id_UNIQUE` (`account_id`),
    UNIQUE KEY `login_name_UNIQUE` (`login_name`),
    UNIQUE KEY `email_address_UNIQUE` (`email_address`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `movies` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `tmdb_id` INT NOT NULL,
    `imdb_id` VARCHAR(20) DEFAULT NULL,
    `title` VARCHAR(500) NOT NULL,
    `original_title` VARCHAR(500) DEFAULT NULL,
    `year` INT DEFAULT NULL,
    `release_date` DATE DEFAULT NULL,
    `tmdb_rating` DECIMAL(3,1) DEFAULT NULL,
    `tmdb_vote_count` INT DEFAULT NULL,
    `imdb_rating` DECIMAL(3,1) DEFAULT NULL,
    `genres` JSON DEFAULT NULL,
    `runtime_minutes` INT DEFAULT NULL,
    `overview` TEXT DEFAULT NULL,
    `tagline` VARCHAR(1000) DEFAULT NULL,
    `poster_path` VARCHAR(500) DEFAULT NULL,
    `poster_url` VARCHAR(1000) DEFAULT NULL,
    `backdrop_path` VARCHAR(500) DEFAULT NULL,
    `backdrop_url` VARCHAR(1000) DEFAULT NULL,
    `original_language` VARCHAR(10) DEFAULT NULL,
    `spoken_languages` JSON DEFAULT NULL,
    `production_countries` JSON DEFAULT NULL,
    `director` VARCHAR(500) DEFAULT NULL,
    `cast_main` JSON DEFAULT NULL,
    `budget` BIGINT DEFAULT NULL,
    `revenue` BIGINT DEFAULT NULL,
    `popularity` DECIMAL(8,3) DEFAULT NULL,
    `adult` TINYINT(1) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `tmdb_id_UNIQUE` (`tmdb_id`),
    KEY `idx_year` (`year`),
    KEY `idx_rating` (`tmdb_rating`),
    KEY `idx_popularity` (`popularity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_preferences` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `genre_action` TINYINT(1) DEFAULT NULL,
    `genre_adventure` TINYINT(1) DEFAULT NULL,
    `genre_animation` TINYINT(1) DEFAULT NULL,
    `genre_comedy` TINYINT(1) DEFAULT NULL,
    `genre_crime` TINYINT(1) DEFAULT NULL,
    `genre_documentary` TINYINT(1) DEFAULT NULL,
    `genre_drama` TINYINT(1) DEFAULT NULL,
    `genre_family` TINYINT(1) DEFAULT NULL,
    `genre_fantasy` TINYINT(1) DEFAULT NULL,
    `genre_history` TINYINT(1) DEFAULT NULL,
    `genre_horror` TINYINT(1) DEFAULT NULL,
    `genre_music` TINYINT(1) DEFAULT NULL,
    `genre_mystery` TINYINT(1) DEFAULT NULL,
    `genre_romance` TINYINT(1) DEFAULT NULL,
    `genre_science_fiction` TINYINT(1) DEFAULT NULL,
    `genre_thriller` TINYINT(1) DEFAULT NULL,
    `genre_war` TINYINT(1) DEFAULT NULL,
    `genre_western` TINYINT(1) DEFAULT NULL,
    `genre_anime` TINYINT(1) DEFAULT NULL,
    `min_year` INT DEFAULT 1900,
    `max_year` INT DEFAULT 2025,
    `min_rating` DECIMAL(3,1) DEFAULT 0.0,
    `runtime_preference` ENUM('short','medium','long','any') DEFAULT 'any',
    `preferred_languages` JSON DEFAULT NULL,
    `prefer_classic` TINYINT(1) DEFAULT 0,
    `prefer_modern` TINYINT(1) DEFAULT 1,
    `prefer_recent` TINYINT(1) DEFAULT 1,
    `child_mode` TINYINT(1) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_id_UNIQUE` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `account`(`account_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `settings` (
    `user_id` INT UNSIGNED NOT NULL,
    `language` VARCHAR(8) NOT NULL DEFAULT 'hu',
    `theme` VARCHAR(20) DEFAULT 'light',
    `auto_save_interval` INT DEFAULT 60,
    `results_per_page` INT DEFAULT 25,
    `animation_speed` VARCHAR(20) DEFAULT 'normal',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `account`(`account_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_movie_interactions` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `movie_id` INT NOT NULL,
    `interaction_type` ENUM('LIKE','DISLIKE') NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_movie_unique` (`user_id`, `movie_id`),
    KEY `idx_user_interactions` (`user_id`, `interaction_type`),
    KEY `idx_movie_interactions` (`movie_id`, `interaction_type`),
    FOREIGN KEY (`user_id`) REFERENCES `account`(`account_id`) ON DELETE CASCADE,
    FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_watchlist` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `movie_id` INT NOT NULL,
    `watched` TINYINT(1) DEFAULT 0,
    `user_rating` DECIMAL(3,1) DEFAULT NULL,
    `added_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `watched_at` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_movie_watchlist_unique` (`user_id`, `movie_id`),
    KEY `idx_user_watchlist` (`user_id`, `watched`),
    KEY `idx_added_at` (`added_at`),
    FOREIGN KEY (`user_id`) REFERENCES `account`(`account_id`) ON DELETE CASCADE,
    FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `idx_movies_year_rating` ON `movies`(`year`, `tmdb_rating`);
CREATE INDEX `idx_interactions_created` ON `user_movie_interactions`(`created_at`);
CREATE INDEX `idx_watchlist_watched_at` ON `user_watchlist`(`watched_at`);