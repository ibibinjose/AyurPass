import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SearchService } from './search.service';
import { AiSearchDto } from '../../dtos/search.dto';
import { Public } from '../../common/public.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Secure, rate-limited AI search endpoint.
   * Public access enabled, input validated, request rate limited.
   */
  @Public()
  @Post('ai')
  @HttpCode(HttpStatus.OK)
  // Stricter rate-limiting to prevent scraping of directory results:
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async searchAi(@Body() dto: AiSearchDto) {
    return this.searchService.searchAi(dto);
  }
}
