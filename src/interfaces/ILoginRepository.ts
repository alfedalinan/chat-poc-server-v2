import { LoginResult } from "../data-sets/LoginResult";

interface ILoginRepository {

    login(username: string): Promise<LoginResult>;
    removeRegisters(isSingle: boolean, registerId?: string): void;

}

export { ILoginRepository }