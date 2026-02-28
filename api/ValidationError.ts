export type ValidationError =
    // general
    'NOT_FOUND'                     |
    'MISSING_PARAMETERS'            |
    'MALFORMATTED_PARAMETERS'       |
    'NON_NUMERIC_IDS'               |

    // adding new user
    'CLUBNAME_INSUFFICIENT'         |
    'PASSWORD_INSUFFICIENT'         |
    'CLUBNAME_ALREADY_TAKEN'        |
    'PASSWORDS_DO_NOT_MATCH'        |
    
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
    