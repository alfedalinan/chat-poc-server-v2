export const Project = {
    name: "Mini-Chat P.O.C.",
    version: "1.0.0",
    authors: [
        "Alfed Alinan"
    ]
};

export const Server = {
    port: 3201,
    url: "http://localhost",
    status: {
        "OK": {
            "CODE": 200,
            "MSG": "OK"
        },
        "INTERNAL_SERVER_ERROR": {
            "CODE": 500,
            "MSG": "Internal Server Error"
        },
        "NOT_FOUND": {
            "CODE": 404,
            "MSG": "Content Not Found"
        },
        "UNAUTHORIZED": {
            "CODE": 401,
            "MSG": "Unauthorized request"
        },
        "FORBIDDEN": {
            "CODE": 403,
            "MSG": "Request Forbidden"
        },
        "BAD_REQUEST": {
            "CODE": 400,
            "MSG": "Bad Request"
        },
        "PRECONDITION_FAILED": {
            "CODE": 412,
            "MSG": "Precondition Failed"
        },
        "PRECONDITION_REQUIRED": {
            "CODE": 428,
            "MSG": "Precondition Required"
        } 

    }
};

export const Database = {
    local: {
        host: "localhost",
        user: "root",
        password: "",
        database: "chat"
    }
};

export const Constants = {
    ENCRYPTION_KEY: "414d4c21464e4531444341494c2d4949",
    IV_KEY: "12b2dcaedc497735",
    IV_LENGTH: 16,
    JWT_ACCESS_SECRET: "53d66e506d1d46186095be9198aa84afa7a4ed80892be9f905f82152eddb18ae",
    JWT_REFRESH_SECRET: "3d91d5771239872e6e60ac03e455abb93db757a116b230a3afc90d0333fc068e",
    ACCESS_TOKEN_EXPIRY: "1h",
    REFRESH_TOKEN_EXPIRY: "8h"
};