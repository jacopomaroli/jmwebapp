Feature: Routing

Scenario: Routing with less than loadMaxArticles(3) articles between two visited articles
  Given I am a visitor attempting to navigate the website
  When I open the homepage
  Then the browser should render articles in the "home" section
  And if I open article A
  Then the browser should render article A for the first time
  And if I click load older
  Then the browser should load loadMaxArticles(3) home page articles
  And if I open article D
  Then the browser should render article D for the first time
  And if I navigate to section "tutorials"
  Then the browser should render articles in the "tutorials" section for the first time
  And if I go back in the history for the first time
  Then the browser should render article D for the second time
  And if I go back in the history for the second time
  Then the browser should render article A for the second time
  And if I request articles newer than D
  Then the browser should render articles B and C
