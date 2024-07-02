Feature: Get mentor

    Background:
        Given a list of mentors registered in the application

    Scenario: Get mentor without specifying criteria
        When I search for a mentor
        Then I should get a list of "20" mentors

    Scenario: Get mentor using price range criteria
        When I search for a mentor with pricing plans between "100" and "200"
        Then I should get a list of mentors that have pricing plans between "100" and "200"

    Scenario: Get mentor using pricing_type criteria
        When I search for a mentor with pricing type "daily"
        Then I should get a list of mentors that have pricing plans with the pricing type set to "daily"

    Scenario: Get mentor using specializations criteria
        When I search for a mentor with specializations "php" and "laravel"
        Then I should get a list of mentors that have specializations "php" and "laravel"

    Scenario: Get mentor using languages criteria
        When I search for a mentor who speaks "French"
        Then I should get a list of mentors that can speak "French"


    Scenario: Get mentor using training type
        When I search for a mentor with training type "remote"
        Then I should get a list of mentors that can teach "remote" courses

    Scenario: Get mentor using mentor availability  criteria
        When I search for a mentor with availability "one_time"
        Then I should get a list of mentors that have set their availability to "one_time"

    Scenario: Get mentor and sort them by price descending
        When I search for a mentor and sort them by price descending
        Then I should get a list of mentors sorted by price descending