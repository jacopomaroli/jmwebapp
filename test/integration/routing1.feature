Feature: Routing
 
Scenario: Simple routing
  Given I am a visitor attempting to navigate the website
  When I open the homepage
  Then the browser should render articles in the "home" section
  And if I open article A
  Then the browser should render article A for the first time
  And if I navigate to section "tutorials"
  Then the browser should render articles in the "tutorials" section for the first time
  And if I go back in the history
  Then the browser should render article A for the second time
  And if I go forward in the history
  Then the browser should render articles in the "tutorials" section for the second time
