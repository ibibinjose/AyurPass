import { IsArray, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AiChatMessageDto {
  @IsIn(['system', 'user', 'assistant'])
  role: 'system' | 'user' | 'assistant';

  @IsString()
  @MaxLength(8000)
  content: string;
}

export class AiChatDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiChatMessageDto)
  messages: AiChatMessageDto[];

  @IsString()
  @IsOptional()
  @MaxLength(100)
  model?: string;
}
