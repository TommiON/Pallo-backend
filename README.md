## Architecture overview: Spheres

Pallo-backend's architecture can be pictured as seven nested spheres where dependencies point inwards, i.e. inner spheres know nothing about the outer.

### 1. Domain Core (/domainCore)
Domain Objects that represent foundational game constructs. Most are instantiated and persisted as an eponymous entity.
- Club: The team, and also user account, of a user.
- Time: Current moment (season, week, day, hour) in gametime. A singleton.
- Player: Team member with individual identity and a set of physical, technical and tactical skills.
- League: Collection of Clubs playing against each other for a season.
- Standing: Club's situation in a League at a given moment (season, week).
- Match: A contest between two Clubs.
- MatchNature: Attribute set that describes a Match as a whole during a certain period of the said Match. 
- MatchEvent: Individual action in a Match.
- Tactics: Tactical setup for a Match.

Some Domain Objects represent overarching concepts that are not instantiated and persisted:
- WeeklyEvent: Recurring event in game's weekly cycle.

Also contains Domain Properties, the core settings of the gameworld, and Domain Utils, a collection of generic helper functions.

### 2. Data Access Interface (/dataAccess)
Domain Core persisted. Exposes Services, each of which generally handles persistence of a certain type of Domain Object (TimeService, LeagueService, PlayerService, etc). To avoid dependency on specific frameworks or databases, this layer is just an interface, defined as abtract Ports. Services expose a dependency-injecting configuration hook that accepts an implementation (Adapter) of a Port. Callers will access data via Ports without knowing about the implementation.

### 3. Domain Engine (/domainEngine)
Algorithms and orchestrating functions that define the fundamental workings of the game. Domain Engine operates at the abstraction level of Domain Objects and knows nothing about the wider flow of the application.
- DomainInitializer: initializes the state of the domain.
- ClubCreator: creates and initializes new user Clubs.
- PyramidExpander: creates Leagues and organizes them into pyramid-like structure.
- FixtureGenerator: generates Matches between Clubs in a League at the start of a season.
- PromotorRelegator: promotes/relegates Clubs between Leagues at the end of a season.
- StandingsManager: updates Standings after Matches, and compares Standings for sorting purposes.
- TacticsBuilder: builds a Club's tactical choices and approaches for a Match.
- MatchResolver: resolves a Match into a sequence of MatchNatures and MatchEvents.

### 4. Persistence Implementation (/persistence)
Concrete implementation of Data Access Interface. Uses TypeORM framework and PostgreSQL database.
- /entities define database tables.
- /adapters implement the Ports of sphere 2.
- /repositories handle accessing database.
- /mappers transform entity data <-> Domain Objects.

- DataSource varmaan myös tänne?

### 5. Application Controllers (/controllers)
Define and handle application behavior by reacting to requests from API and Scheduler that sit further out. Controllers use Data Access Interface for data needs and Domain Engine for performing domain operations. Organized into functions whose names describe what is happening, such as:
- startNewSeason()
- createNewUserClub()
- authenticateLogin()
- resolveMatches()
- etc.

(- EventNotifications???)

### 6. Interactors (/api, /scheduler)
Receive or generate impulses that make the application to do things. Consists of two parts:
- Scheduler: the application's timekeeper that maintains a periodic clock-tick. Generates application-internal events by checking on each tick whether it is time to do something. Also contains appClock that provides API with the game's time. (Nobody inwards from Interactors sphere ever needs to know what time it is.)
- API: REST endpoints for frontend user interaction. Contains Express routers serving endpoints, payload types, and request validators.

### 7. The outside (/)
- index.ts performs the init and startup sequence: sets up REST routes, sets up datasource, provides dataAccess Ports with Adapter implementations, lauches Scheduler.
- environment.ts?
- (e2e tests when ready)

## Match Resolving

MatchResolver (/domainEngine/matches/MatchResolver.ts and its private sub-engines) generates outcome of a Match. Match resolving follows pipes & filters architecture in a simplified form (no buffers, no concurrency). State is fed through a series of filters that may produce MatchEvents and/or a changes in MatchNature. Filters utilize teams' tactical approaches, player characters, and some randomness. The aim is a modular engine where tactical aspects can be added, removed and changed without breaking the whole thing. In other words, MatchNature and MatchEvent are the two fixed concepts that define the run of a Match, while filters producing these may evolve.

### MatchNature

MatchNature (/domainCore/MatchNature.ts) contains attributes about the Match as a whole.
- Intensity: How much or little is happening.
- Balance: How big a portion of play happens in different areas of the pitch.
- Possession: How big a share of ball is home team having in different areas of the pitch.

A Match will have multiple MatchNatures attached to it, as game evolves during the 90 minutes. 

Intensity affects how frequently the filter chain is re-run: the higher the intensity, the more potential MatchEvents and potential changes of MatchNature. In practice, higher intensity reduces MatchNature's endMinute attribute, causing MatchResolver's main loop to launch the next filter chain sooner. Lower intensity does the opposite.

Balance and possession, on the other hand, affect the distribution of different kinds of MatchEvents, but not the amount of them.

### Match Event

MatchEvent (/domainCore/MatchEvent.ts) is a concrete thing happening in a Match. There are several kinds:

### Filter chain

MatchResolver runs a filter chain in its main loop. By default, this happens every MATCH_GRANULARITY_MINUTES game minutes, but changes in MatchNature's intensity may change this.

Filters are derived from the abstract class AbstractMatchFilter. They receive input of type MatchFilterResult, process it, and pass it on. MatchFilterResult contains the following data:
- the home team's Tactics object. At the beginning, it is read in as the user has defined it for the Match. It then becomes MatchResolver's work memory and may change somewhat during the filterings (for instance, Players in opening lineup and substitutes list swap places if a substitution MatchEvent takes place.)
- visiting team's Tactics, similarly.
- list of MatchNatures generated so far.
- list of MatchEvents generated so far.

Once the main loop stops, MatchNatures and MatchEvents are persisted and become the official report on how the Match went. Changes to Tactics are not persisted.

From functional point of view, filters can be divided into three groups that follow each other like this. Intensity filters >> Structural filters >> Event filters (Vaiko ehkä ei sittenkään, vaan kaikki filtterit voivat teemansa mukaisesti sekä muokata Naturea että tuottaa Eventtejä. Esim. Substitution tuottaa Eventin ja lisää intensiteettiä?)







- Substitution impulse (laukaisee aina putken)
- General approach impulse (aktiivisempi, ekspansiivisempi taktiikka laukaisee putken useammin; jos molemmilla joukkueilla aktiivinen taktiikka, tulee erityisen paljon syklejä)
- Individual effect impulse, voi kasvattaa (temperamenttinen, arvaamaton, luova), mainitaan aina joko hyvänä tai huonona pelinä?
- FatigueImpulseFilter


- MatchPhase describes general dominance of teams in different parts of the pitch. It is expressed as amount of possession in nine zones of the pitch, and affects the distribution (but not amount) of goal-opportunity Events.
- MatchEvent: viime kädessä ainoa oleellinen event maalitilanne -> lopputulos? Tämän lisäksi loukkaantuminen, kortit, Tarvitaanko eventtien ketjutusta? Määrittele erilaiset maalipaikat, ehkä noin 10 erilaista tai vähän yli?

- Suuri ratkaisematon kysymys: miten pelaajien ominaisuudet mäppäytyvät MatchPhase ja MatchEvent filttereiksi? Toistaiseksi ominaisuuslistaa ei ole edes päätetty.
- Ylätason taktiikka pysyy samana läpi pelin? Sen sijaan pelaajavaihdon yhteydessä voi säätää pelaajakohtaista taktiikkaa? Eli sama järjestely kuin Hattrickissa: yleistaktiikka, yksilöllinen taktiikka?
- Ylätason taktiikka: https://futiapp.substack.com/p/how-many-ways-are-there-to-play-football
- Oleellista: parametrointi domainPropertiesissa. Yksi parametri per filtteri? Pysyisi ainakin hallittavana.
- Oleellista: selkeä taktiikka<->lopputulos -mäppäys, selkeitä ja ennakoitavia säätimiä, vaikka ei olisi täysin realistista, esim. pelaajien kestävyys näkyy suoraan ja havaittavasti, samoin esim. lähestymistavan aktiivisuus (enemmän pipe-inputteja, enemmän loukkaantumisriskiä)
- Oleellista: kokonaisarkkitehtuuri, ei kaottiinen spagettikasa

Millaisia taktisia ylätason säätöjä:
- Puolustuslinja: matala, neutraali, korkea
- Kaaos/hallinta
- Aktiivinen/passiivinen
- Suositaan laitoja/keskustaa/neutraali
- Pallonmenetys: kuoreenvetäytyminen, neutraali, prässi
- Pallonsaanti: nopeasti/kärsivällisesti
- Syöttäminen: pitkä/lyhyt/vaihteleva
- Yritetäänkö kaukolaukauksia?

Pelaajakohtainen ohje ominaisuuksien kertoimina?
- Maalivahti: shotstopper/sweeper, build-up/kick-away
- Keskuspuolustaja:
- Laitapuolustaja: 

User output: automaattisesti generoitua tekstiä/grafiikkaa MatchPhasejen ja -Eventtien perusteella.

## API


---

case study, mieti miten menee jos halutaan...
- laajentuva liifgapyramidi täytetään uusien klubien createTimen perusteella järjestyksessä (nyt taitaa mennä epädeterministisesti?)
- muuttaa sitä laukaiseeko riittävä määrä klubeja ensimmäisen kauden automaattisesti
- kauden alussa määriteltävä ManCity-vähennys
- tehdä erilliset mies- ja naisliigat
- tehdä alueelliset liigat
- tehdä Mestereiden liiga alueiden välille
- tehdä kansallinen cup
- mahdollistaa klubien poistuminen pelistä
- mahdollistaa zombit
- pelaajille vapaasti päätettävät pelinumerot

----

### Directory structure

- **/domainModel**: Domain objects and their business logic. Each Domain Object offers a Domain Data Contract that defines what is exposed, and fromEntity/toEntity factories/adapters for dealing with persistence level.

- **/persistence**: Persisted version of the Domain model. Contains Entities and Repositories corresponding to Domain objects. Persistence Data Contracts define how Domain objects are persisted.

- **/api**: REST endpoints for frontend. Request and response types. Request validators.

- **/services**: Mediates between API and inner parts of the application. Responsible for dealing with the persistence level. Returns Domain objects.

- **/domainEngine**: Larger-scale business logic. Deals with Domain objects and does things to them.

- **/domainProperties**: Domain-related settings and properties.

- **/config**: Technical configuration.

- **/utils**: Helper functions and stuff.

### Flow

(huom. tuohon tarvitaan myös se että API "uses" services, kun kyselee sovellukselta palautettavaa. Domain Data Contracts koskee vain datatyyppejä.

Lisäksi: API:sta tulevan flown lisäksi on DomainEnginen ajastetut toiminnot, jotka myös määrittävät flowta.)

API layer

↓ (uses)

Domain Data Contracts (PlayerData, ClubData, etc.) for crafting response types

↓ (implements)

Domain models (Player, Club, etc.)

↕ (adapters: fromEntity/toEntity)

Persistence Data Contracts that define what is persisted (PlayerEntityData, ClubEntityData, etc.)

↓ (uses)

Entity schemas (PlayerEntity, ClubEntity, etc.)

↓ (maps to)

Database tables

## Domain objects

### League

A collection of Clubs thrown together for a season. League is active for the season; after that, it remains archived in the database.

League holds the Clubs in it. Furthermore, it holds Matches between these Clubs. Matches are pre-generated when League is created, then played out week by week. Furthermore, there's a collection of Standings, one for each Club, and one for each week of the season. Sorting the weeknumber-MAX()'d Standings gives the current league table, but older Standings are also available, making it possible to timetravel to previous weeks' league tables. Clubs, Matches and Standings are Domain objects in their own right, foreign-key-linked to a League.

Additional properties:

- `seasonNumber`. 
- `started: boolean` and `finished: boolean`.
- `promotesTo: League`. Where winner(s) is promoted to next season, and from where bottom club(s) is relegated in place. `null` for the topmost League.
- division level (position in the pyramid hierarchy), possibly some additional naming, like "Division 3, Southwest".

Leagues form a linked-list pyramid hierarchy. There is a single top league, and each League has either 2 or 4 children (parametrized in Domain properties). The second-from-bottom level may have exceptions to this.

### Match

A match between two Clubs happening on a given week in a League. Once being played, a Match holds an array of MatchEvents. Additional properties:

- `started: boolean` and `finished: boolean`.

### MatchEvent

A single event of note during a Match, such as a goal. (Tämä vaatii tarkan mietinnän yhdessä DomainEnginen kanssa, riittävän geneerinen jotta mahdollistaa enginen muuttelun, ja lisäksi pitänee rakentaa jonkinlainen MatchEvent-ketjujen mahdollisuus)

### Standing

Represents a Club's situation in a League on a given week. Used to determine the ordering of the Clubs in a League.

Properties:

- `weekNumber`
- `league: League`
- `club: Club`
- situation: points, wins, losses, draws, goals for, goals against, etc.

### Club

### Player

### Time

Represents the current time in the gameworld (season, week, day, hour).

### WeeklyEvent

Represents various recurring events that happen weekly. Unlike most Domain objects, this is purely "conceptional", i.e. it's not persisted.

## Domain engine

### Timekeeping

- Upon startup, `initializeAndStartDomain()` initializes the starting `Time` (domain object) to either zero-hour or to a previous state from the database.
- `initializeAndStartDomain()` then fires up a scheduler, which knows nothing about domain-spesific `Time` and just periodically calls `timeService.advanceTime()` to advance `Time` by one hour. This happens either once every real-time hour, or more frequently, as parametrized.
- `Time` handles the actual time change. Changed time is passed back to `timeService`, which persists it.
- `Time` also offers subscriptions for listeners interested in changes.
    - `SeasonRunner` listens and reacts when a new season begins, and when new user Clubs have been registered.
    - `WeekRunner` listens and reacts when a new week begins, and when deadlines for `WeeklyEvents` expire.

### League administration
- `SeasonRunner` reacts when new, non-attached (not yet belonging to a League) Clubs appear.
    - Before there is a season: When at least one such club is present, the first League(s) is founded and the first seasons starts. The League(s) is backfilled with zombies as needed.
    - During season: If new non-attached Clubs appear, they override zombie Clubs on the hoof. If there are no more zombie places available, the user club remains on waiting list (not attached to a League) until new season starts.
    - When new season begins:

#### Generating a League

(using FixtureGenerator in DomainEngine)

#### In-season zombie elimination

#### In-between-seasons League organization

In between seasons, LeagueOrganizator (DomainEngine) does the following:
- Normal promotion and relegation: promoted and relegated Clubs change places.
- Zombie relegation: starting from top, if there are zombie Clubs in non-relegating places, they are relegated anyway. This means there may open up additional promotions on the levels below. Zombie relegation recurs until all zombies are as low as they can go. (Zombia ei siirretä koskaan ylempään liigaan. Mutta mitä tapahtuu jos alemmassa liigassa enemmän zombeja kuin ylemmässä? Pitäisikö sittenkin aloittaa alhaalta?)
- User Clubs on waiting list take zombies' places, filling one League first, then moving on to the next.
- If there are Leagues containing only zombies, these Leagues (and zombies in them) are destroyed. 
- If there are more waiting user Clubs that there were zombies, just enough new Leagues are created to accomodate users. This may mean new pyramid levels, but on the lowest level, only as many Leagues are created as needed to accomodate User clubs (the last backfilled with zombies if needed). Thus, the pyramid span factor may be non-standard on the lowest level, meaning non-standard promotions/relegations between the bottom and second-from-bottom levels at the end of next season. Whole pyramid levels may also be deleted if there is a lot of zombies.
- New Leagues for the upcoming season created.