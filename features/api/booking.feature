# features/api/booking.feature
@api
Feature: Booking API - Restful Booker

  As a consumer of the Booking API
  I want to manage hotel bookings via REST endpoints
  So that I can verify data integrity across all CRUD operations

  Background:
    Given I am authenticated with the Booking API

  @api @smoke
  Scenario: Get all bookings returns a non-empty list
    When I request all bookings
    Then the response status should be 200
    And the response should contain a list of bookings

  @api @smoke
  # Booking dates are generated relative to today by BookingDatesFactory
  Scenario: Create a new booking successfully
    When I create a booking with the following details:
      | firstname | lastname | totalprice | depositpaid | additionalneeds |
      | Turkay    | Yildiz   | 250        | true        | Breakfast       |
    Then the response status should be 200
    And the response should contain the booking id
    And the booking firstname should be "Turkay"
    And the booking lastname should be "Yildiz"

  @api
  Scenario: Get a specific booking by id
    Given a booking exists for "James" "Brown"
    When I get the booking by id
    Then the response status should be 200
    And the booking firstname should be "James"
    And the booking lastname should be "Brown"

  @api
  Scenario: Update a booking with valid auth token
    Given a booking exists for "Anna" "Smith"
    When I update the booking with the following details:
      | firstname | lastname | totalprice | depositpaid | additionalneeds    |
      | Anna      | Smith    | 400        | true        | Breakfast & Dinner |
    Then the response status should be 200
    And the booking totalprice should be 400

  @api
  Scenario: Partially update a booking firstname
    Given a booking exists for "Carlos" "Garcia"
    When I partially update the booking firstname to "Carlo"
    Then the response status should be 200
    And the booking firstname should be "Carlo"

  @api @negative
  Scenario: Get a non-existent booking returns 404
    When I get the booking with id 999999
    Then the response status should be 404

  @api @positive
  Scenario: Delete a booking with valid auth token
    Given a booking exists for "Delete" "Me"
    When I delete the booking
    Then the response status should be 201
    And the booking no longer exists

  @api @negative
  # Known API bug: returns 500 instead of 400 for missing required fields
  Scenario: Create a booking with missing required fields returns error
    When I create a booking with missing firstname
    Then the response status should be 500
