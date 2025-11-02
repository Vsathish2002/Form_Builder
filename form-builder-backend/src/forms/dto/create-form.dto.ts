// import { IsString, IsBoolean, IsArray, ValidateNested, IsOptional } from 'class-validator';
// import { Type } from 'class-transformer';

// class FormFieldDTO {
//   @IsString() label: string;
//   @IsString() type: string;
//   @IsBoolean() required: boolean;

//   @IsArray()
//   @IsOptional()
//   options?: string[];

//   @IsOptional()
//   order?: number;

//   @IsOptional()
//   validation?: any;
// }
// export class CreateFormDto {
//   @IsString()
//   title: string;

//   @IsString()
//   @IsOptional()
//   description?: string;

//   @IsBoolean()
//   @IsOptional()
//   isPublic?: boolean;

//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => FormFieldDTO)
//   @IsOptional()
//   fields?: FormFieldDTO[];
// }

// create-form.dto.ts
import { IsString, IsBoolean, IsArray, ValidateNested, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class FormFieldDTO {
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
  status?: 'Active' | 'Inactive'; // ✅ Add status
}
