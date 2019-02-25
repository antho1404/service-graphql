# GraphQL service



# Contents

- [Installation](#Installation)
- [Definitions](#Definitions)
  - [Events](#Events)
    - [query](#query)
  - [Tasks](#Tasks)
    - [completeQuery](#completequery)

# Installation

## MESG Core

This service requires [MESG Core](https://github.com/mesg-foundation/core) to be installed first.

You can install MESG Core by running the following command or [follow the installation guide](https://docs.mesg.com/guide/start-here/installation.html).

```bash
bash <(curl -fsSL https://mesg.com/install)
```

## Service

Download the source code of this service, and then in the service's folder, run the following command:
```bash
mesg-core service deploy
```

# Definitions

# Events

## query

Event key: `query`

Emitted for every graphql query request

| **Name** | **Key** | **Type** | **Description** |
| --- | --- | --- | --- |
| **fields** | `fields` | `Object` | Requested query fields |
| **sessionID** | `sessionID` | `String` | Unique ID of graphql query request |

# Tasks

## completeQuery

Task key: `completeQuery`



### Inputs

| **Name** | **Key** | **Type** | **Description** |
| --- | --- | --- | --- |
| **data** | `data` | `Any` | Data to send as response to graphql query request |
| **sessionID** | `sessionID` | `String` | Unique ID of graphql query request |

### Outputs

#### error

Output key: `error`



| **Name** | **Key** | **Type** | **Description** |
| --- | --- | --- | --- |
| **message** | `message` | `String` |  |

#### success

Output key: `success`



| **Name** | **Key** | **Type** | **Description** |
| --- | --- | --- | --- |
| **elapsedTime** | `elapsedTime` | `Number` | Elapsed time in nanoseconds for query request to complete |
| **sessionID** | `sessionID` | `String` | Session ID of graphql query request |


