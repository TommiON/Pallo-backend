# Pallo-backend

## Structure

- **/domainModel**: Domain model containing Domain objects, and factory functionalities for creating these.
- **/persistence**: Domain model persisted; contains Entities and Repositories.
- **/api**: REST endpoints; request and response types; request validators.
- **/services**: Mediates between API and inner parts of the application; returns Domain Objects.
- **/domainEngine**: Actual business logic; deals with Domain objects and does things to them.
- **/domainProperties**: Domain-related settings and properties.
- **/config**: Technical configuration.
- **/utils**: Helper functions and stuff.

## Domain objects

### League

A collection of Clubs thrown together for a season. League is active for the season; after that, it remains archived in the database.

League holds the Clubs in it. Furthermore, it holds Matches between these Clubs. Matches are pre-generated when League is created (using FixtureGenerator in DomainEngine), then played out week by week. Furthermore, there's a collection of Standings, one for each Club, and one for each week of the season. Sorting the weeknumber-MAX'd Standings gives the current league table, but older Standings are also available, making it possible to timetravel to previous weeks' league tables. Clubs, Matches and Standings are Domain objects in their own right, foreign-key-linked to a League.

Additional properties:

- `seasonNumber`. 
- `started: boolean` and `finished: boolean`.
- `promotesTo: League`. Where winner(s) is promoted to next season, and from where bottom club(s) is relegated in place. `null` for the topmost League.
- division level (position in the pyramid hierarchy), possibly some additional naming, like "Division 3, Southwest".

Leagues form a pyramid hierarchy. There is a single top league, and each League has either 2 or 4 children (parametrized in Domain properties). The second-from-bottom level may have exceptions to this, see below. 

When at least one user Club joins, the topmost League is created, backfilled with zombie clubs if needed. Whenever a new user Club is created during a season, it replaces the lowest-ranking zombie Club in the League hierarchy, but if there are no more zombie places available, the User club remains on waiting list until new season starts.

In between seasons, LeagueOrganizator (DomainEngine) does the following:
- Normal promotion and relegation: promoted and relegated Clubs change places.
- Zombie relegation: starting from top, if there are zombie Clubs in non-relegating places, they are relegated anyway. This means there may open up additional promotions on the levels below. Zombie relegation recurs until all zombies are as low as they can go.
- User Clubs on waiting list take zombies' places, filling one League first, then moving on to the next.
- If there are Leagues containing only zombies, these Leagues (and zombies in them) are destroyed. 
- If there are more waiting user Clubs that there were zombies, just enough new Leagues are created to accomodate users. This may mean new pyramid levels, but on the lowest level, only as many Leagues are created as needed to accomodate User clubs (the last backfilled with zombies if needed). Thus, the pyramid span factor may be non-standard on the lowest level, meaning non-standard promotions/relegations between the bottom and second-from-bottom levels at the end of next season. Whole pyramid levels may also be deleted if there is a lot of zombies. 

### Standing

Represents a Club's situation in a League on a given week. Used to determine the ordering of the Clubs in a League.

Properties:

- `weekNumber`
- `league: League`
- `club: Club`
- situation: points, wins, losses, draws, goals for, goals against, etc.

## Domain engine

### Time

(preliminary musings)

- Season, with (TOTAL_NUMBER_OF_TEAMS - 1) * 2 Gameweeks in it.
- Gameweek, with recurring sequence of WeeklyOccurrences in it.
- WeeklyOccurrences (training instructions deadline, match instructions deadline, match start, etc.). Need to have some easy-to-maintain way to determine deadlines inside Gameweek. Also, possibility to add/remove with relative ease.
- No correspondence with actual, physical time. 
- Time starts to run: when the first user Club, and the topmost League, is created.