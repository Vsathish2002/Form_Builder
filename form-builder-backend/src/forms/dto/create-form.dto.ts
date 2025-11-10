
import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormFieldDTO {
  @ApiProperty({ example: 'field_1', description: 'Unique field identifier' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Full Name', description: 'Label displayed for the field' })
  @IsString()
  label: string;

  @ApiProperty({
    example: 'text',
    description: 'Field type (e.g., text, checkbox, select, file, link)',
  })
  @IsString()
  type: string;

  @ApiProperty({ example: true, description: 'Whether the field is required' })
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({
    example: ['Option 1', 'Option 2'],
    description: 'Applicable for select/radio/checkbox fields',
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional({ example: 1, description: 'Display order of the field' })
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    example: { minLength: 3, maxLength: 50 },
    description: 'Validation rules for the field',
  })
  @IsOptional()
  validation?: any;

  @ApiPropertyOptional({
    example: 'https://youtu.be/video123',
    description: 'Optional value for video or link field type',
  })
  @IsOptional()
  @IsString()
  extraValue?: string;

  @ApiPropertyOptional({
    example: 'email',
    description: 'Subtype of field, e.g., for text input (email, password, number)',
  })
  @IsOptional()
  @IsString()
  subtype?: string;
}

export class CreateFormDto {
  @ApiProperty({ example: 'Customer Feedback Form', description: 'Title of the form' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Collect feedback about our service quality',
    description: 'Brief description of the form',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'If true, form is publicly accessible',
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional(
    {
  title: "Feedback Form",
  description: "Collect feedback about our service quality"
}
)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDTO)
  @IsOptional()
  fields?: FormFieldDTO[];

  @ApiPropertyOptional({
    example: 'Active',
    description: 'Status of the form',
    enum: ['Active', 'Inactive'],
  })
  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';
}
