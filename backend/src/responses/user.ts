export class UserResponse {
    constructor(
        public id: number,
        public username: string,
        public name: string,
        public email: string,
        public createdAt: Date
    ) { }
}