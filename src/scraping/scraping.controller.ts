import { Controller, Get, Query } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('scrape')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get('data')
  async getData(@Query('username') username: string, @Query('password') password: string) {
    const data = await this.scrapingService.scrapeData(username, password);
    return { data };
  }
}
