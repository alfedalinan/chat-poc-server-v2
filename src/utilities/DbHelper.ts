const connection = global;

export const mysqlToPromise = (query: String) : Promise<any> => {

    return new Promise((resolve, reject) => {

        connection['dbConnection'].query(query, (err, result) => {
                
            if (err != null) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });

    });

};

export const mysqlParameterizedPromise = (query: String, params: any) : Promise<any> => {

    return new Promise((resolve, reject) => {

        connection['dbConnection'].query(query, params, (err, result) => {
            
            if (err != null) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
        
    });

};