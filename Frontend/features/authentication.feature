# language: en

Feature: User Registration and Authentication
  As a new user
  I want to create an account
  So that I can access the movie recommendation service

  Scenario: Successful registration
    Given the user is on the registration page
    And enters the following data:
      | field              | value                    |
      | fullName           | Test User                |
      | email              | test@example.com         |
      | username           | test_user                |
      | password           | Secure123!               |
    When they click the "Fiók létrehozása" button
    Then the system creates the account

  Scenario: Successful login
    Given the user is registered in the system
    And is on the login page
    When they enter username "test_user"
    And enter password "Secure123!"
    And click the "Belépés" button
    Then the system authenticates the user
    And redirects to the dashboard
    And generates a JWT token

  Scenario: Forgot password reset
    Given the user has forgotten their password
    And is on the "Password Reset" page
    When they enter email address "test@example.com"
    And click the "Helyreállítási link küldése" button
    Then the system sends a reset link to the email address

  Scenario: Delete account
    Given the user is registered in the system
    And is logged in
    And is on the profile page
    When they prepare to confirm the deletion
    And click the "Fiók törlése" button
    Then the account is deleted
    And redirects to the login page
