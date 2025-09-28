# Movie Recommendation System

A modern web application for movie recommendations with user preferences and personalized browsing experience.

## Overview

This project is a full-stack movie recommendation system that allows users to discover movies based on their personal preferences. Users can browse through movies using an intuitive swipe interface, mark their favorites, and receive personalized recommendations.

## Features

- User registration and authentication system
- Personalized movie preference settings
- Interactive movie browsing with swipe gestures
- Favorite movies collection and management
- Multi-language support (Hungarian and English)
- Responsive design with theme switching
- Real-time recommendation engine

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MariaDB** database with Sequelize ORM
- **bcrypt** for secure password hashing
- **SMTP** email integration for password recovery

### Frontend
- **Vue.js 3** with Composition API
- **Vite** for fast development and building
- **CSS3** with custom design system
- **Internationalization** (i18n) support

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- MariaDB server
- Modern web browser

### Installation and Setup

1. **Backend Setup**
   ```bash
   cd Backend
   npm install
   node app.js
   ```

2. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

3. **Database Setup**
   - Create MariaDB database
   - Run the provided SQL setup script
   - Configure database connection in environment variables

4. **Access the Application**
   - Backend API: http://localhost:3000
   - Frontend Interface: http://localhost:3001

## Project Structure

- `Backend/` - Server-side application with API endpoints
- `Frontend/` - Client-side Vue.js application
- `database_setup.sql` - Database schema and initial data
- Documentation files and configuration

## Usage

1. Register a new user account
2. Set your movie preferences (genres, years, ratings)
3. Browse movies using swipe interactions
4. Build your favorite movies collection
5. Receive personalized movie recommendations

## Development

The application follows modern web development practices with:
- RESTful API architecture
- Component-based frontend structure
- Secure authentication and data handling
- Responsive and accessible user interface
- Multilingual content support

## License

Educational project developed for learning purposes.
