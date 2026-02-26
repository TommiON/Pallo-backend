# Pallo-backend

## Structure

**/domainModel** Domain model containing Domain Objects, and factory functionalities for creating these.

**/persistence** Domain model persisted; contains Entities and Repositories.

**/api** REST endpoints; request and response types; request validators.

**/services** Mediates between API and inner parts of the application; returns Domain Objects.

**/domainEngine** Actual business logic; deals with Domain Objects and does things to them.

**/domainProperties** Domain-related settings and properties.

**/config** Technical configuration.

**/utils** Helper functions and stuff.