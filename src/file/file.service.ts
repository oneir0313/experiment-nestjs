import { Injectable, Logger } from '@nestjs/common';
import { Parser } from 'json2csv';

@Injectable()
export class FileService {
    private logger = new Logger(FileService.name);
    private fields = ['car', 'price', 'color'];
    private files = [
        {
          "car": "Audi",
          "price": 1,
          "color": "blue"
        }, {
          "car": "BMW",
          "price": 1,
          "color": "black"
        }, {
          "car": "Porsche",
          "price": 1,
          "color": "green"
        }
      ];
    
    getFile() {
        const fields = this.fields;
        const csvParser = new Parser({fields});

        const csv = csvParser.parse(this.files)

        return Promise.resolve(csv);
    }
}
