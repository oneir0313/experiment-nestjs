import { Injectable, HttpException } from '@nestjs/common';
import { CreateUserDTO } from './dto/createUser.dto';
import { Observable, of } from 'rxjs';

@Injectable()
export class UsersService {
    //假資料
    private users = [
        { _id: 1, _name: 'Michael', _age: 25 },
        { _id: 2, _name: 'Mary', _age: 27 },
    ];

    //使用Promise，盡可能避免使用callback方式。
    getAllUsers() {
        return Promise.resolve(this.users);
    }
    getUser(id: number) {
        const user = this.users.find(user => {
            return user._id === id;
        });
        if (!user) {
            //nestjs對於http exception有API可以調用，建議使用。
            throw new HttpException('user not found', 404);
        }
        return Promise.resolve(user);
    }
    //在nestjs也是可以歡樂使用Rx.js
    addUser(user: CreateUserDTO): Observable<object[]> {
        this.users.push(user);
        return of(this.users);
    }
}
