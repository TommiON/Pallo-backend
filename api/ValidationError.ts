export type ValidationError =
    // general
    'MISSING_PARAMETERS'            |
    'MALFORMATTED_PARAMETERS'       |
    'NON_NUMERIC_IDS'               |

    // adding new user
    'USERNAME_INSUFFICIENT'         |
    'PASSWORD_INSUFFICIENT'         |
    'USERNAME_ALREADY_TAKEN'        |
    'CLUBNAME_INSUFFICIENT'         |
    'CLUBNAME_ALREADY_TAKEN'        |
    
    // logging in
    'USERNAME_NOT_FOUND'            |
    'PASSWORD_DOES_NOT_MATCH'       |

    // JSONWebtoken validation
    'TOKEN_DOES_NOT_MATCH'          |
    'TOKEN_MISSING'                 |
    'TOKEN_MALFORMATTED'            |
    
    // authorization
    'UNAUTHORIZED'                  |
    'URL_PARAMETER_MALFORMATTED';
    