import { Injectable } from '@nestjs/common';
import { LogMethod } from '../decorator';

@Injectable()
export class AppService {
    @LogMethod({ message: 'get hello' })
    getHello(): string {
        return 'Hello World!';
    }
}
