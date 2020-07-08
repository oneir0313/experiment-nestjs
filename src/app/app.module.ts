import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from '../users/users.service';
import { UsersController } from '../users/users.controller';
import { FileService } from '../file/file.service';
import { FileController } from '../file/file.controller';

@Module({
    imports: [],
    controllers: [AppController, UsersController, FileController],
    providers: [AppService, UsersService, FileService],
})
export class AppModule {}
