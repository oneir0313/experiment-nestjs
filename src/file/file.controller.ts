import { Controller, Get, Post, Request, Param, Next, HttpStatus, Body, Res } from '@nestjs/common';
import { FileService } from './file.service';
import { Response } from 'express';


@Controller('file')
export class FileController {
    constructor(private fileService: FileService) {}

    @Get('/')
    async getCSV(@Res() res: Response) {
        await this.fileService
            .getFile()
            .then(csv => {
                res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                res.set('Content-Type', 'text/csv');
                res.status(HttpStatus.OK).send(csv)
            })
    }
}
