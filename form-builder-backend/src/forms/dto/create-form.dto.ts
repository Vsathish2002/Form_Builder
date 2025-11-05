import { IsString, IsBoolean, IsArray, ValidateNested, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class FormFieldDTO {
  @IsString() id: string;
  @IsString() label: string;
  @IsString() type: string;
  @IsBoolean() required: boolean;

  @IsArray()
  @IsOptional()
  options?: string[];

  @IsOptional()
  order?: number;

  @IsOptional()
  validation?: any;

  @IsOptional()
  @IsString()
  extraValue?: string; // ✅ For video/link URL

  @IsOptional()
  @IsString()
  subtype?: string;
}

export class CreateFormDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDTO)
  @IsOptional()
  fields?: FormFieldDTO[];

  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';
}
