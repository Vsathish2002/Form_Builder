// import {
//   Controller,
//   Post,
//   Get,
//   Put,
//   Delete,
//   Param,
//   Body,
//   UseGuards,
//   Request,
//   UseInterceptors,
//   UploadedFiles,
//   Req,
//   BadRequestException,
// } from '@nestjs/common';
// import { FormsService } from './forms.service';
// import { CreateFormDto } from './dto/create-form.dto';
// import { UpdateFormDto } from './dto/update-form.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { User } from '../users/user.entity';
// // import { FilesInterceptor } from '@nestjs/platform-express';
// import { AnyFilesInterceptor } from '@nestjs/platform-express';


// @Controller('forms')
// export class FormsController {
//   constructor(private formsService: FormsService) {}

//   // Create new form
//   @UseGuards(JwtAuthGuard)
//   @Post()
//   create(@Request() req, @Body() dto: CreateFormDto) {
//     const user: User = req.user;
//     return this.formsService.createForm(user, dto);
//   }

//   // Get all forms
//   @UseGuards(JwtAuthGuard)
//   @Get()
//   findAll(@Request() req) {
//     const user: User = req.user;
//     return this.formsService.findAll(user);
//   }

//   // Get form by slug (public)
//   @Get('slug/:slug')
//   findOneBySlug(@Param('slug') slug: string) {
//     return this.formsService.findOne(slug);
//   }

//   // Get form by ID
//   @UseGuards(JwtAuthGuard)
//   @Get('id/:id')
//   findOneById(@Param('id') id: string, @Request() req) {
//     const user: User = req.user;
//     return this.formsService.findById(id, user);
//   }

//   // Update form
//   @UseGuards(JwtAuthGuard)
//   @Put(':id')
//   update(@Param('id') id: string, @Body() dto: UpdateFormDto, @Request() req) {
//     const user: User = req.user;
//     return this.formsService.updateForm(id, dto, user);
//   }

//   // Delete form
//   @UseGuards(JwtAuthGuard)
//   @Delete(':id')
//   remove(@Param('id') id: string, @Request() req) {
//     const user: User = req.user;
//     return this.formsService.deleteForm(id, user);
//   }

//   // ✅ Submit public response with file support (UPDATED)
//   @Post('public/:slug/submit')
// @UseInterceptors(AnyFilesInterceptor())
//   async submitPublic(
//     @Param('slug') slug: string,
//     @UploadedFiles() uploadedFiles: Express.Multer.File[],
//     @Req() req: any,
//   ) {
//     try {
//       const formData = req.body; // now each field ID is a key
//       console.log("📩 Received form data keys:", Object.keys(formData));
//       console.log("📎 Uploaded files:", uploadedFiles?.map(f => f.filename));

//       const response = await this.formsService.submitResponseWithFiles(
//         slug,
//         formData,
//         uploadedFiles,
//       );

//       if (formData.sessionId) {
//         await this.formsService.deleteFormDraft(slug, formData.sessionId);
//       }

//       return response;
//     } catch (err) {
//       console.error("❌ submitPublic error:", err);
//       throw new BadRequestException(err.message || "Form submission failed");
//     }
//   }

//   // Get form responses
//   @UseGuards(JwtAuthGuard)
//   @Get(':id/responses')
//   getResponses(@Param('id') id: string, @Request() req) {
//     const user: User = req.user;
//     return this.formsService.getFormResponses(id, user);
//   }

//   // Get user's forms
//   @UseGuards(JwtAuthGuard)
//   @Get('user/me')
//   getUserForms(@Request() req) {
//     const user: User = req.user;
//     return this.formsService.getUserForms(user);
//   }

//   // Delete response
//   @UseGuards(JwtAuthGuard)
//   @Delete('responses/:responseId')
//   deleteResponse(@Param('responseId') responseId: string, @Request() req) {
//     const user: User = req.user;
//     return this.formsService.deleteResponse(responseId, user);
//   }

//   // Generate QR code for form
//   @UseGuards(JwtAuthGuard)
//   @Get(':id/qrcode')
//   generateQrCode(@Param('id') id: string, @Request() req) {
//     const user: User = req.user;
//     return this.formsService.generateFormQrCode(id, user);
//   }

//   // Save form draft
//   @Post('public/:slug/draft')
//   async saveDraft(
//     @Param('slug') slug: string,
//     @Body() body: { draftData: any; sessionId?: string },
//   ) {
//     return this.formsService.saveFormDraft(slug, body.draftData, body.sessionId);
//   }

//   // Load form draft
//   @Get('public/:slug/draft')
//   async loadDraft(
//     @Param('slug') slug: string,
//     @Body('sessionId') sessionId?: string,
//   ) {
//     return this.formsService.loadFormDraft(slug, sessionId);
//   }

//   // Delete form draft
//   @Delete('public/:slug/draft')
//   async deleteDraft(
//     @Param('slug') slug: string,
//     @Body('sessionId') sessionId?: string,
//   ) {
//     await this.formsService.deleteFormDraft(slug, sessionId);
//     return { message: 'Draft deleted successfully' };
//   }
// }

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/user.entity';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Forms (Form Builder)')
@ApiBearerAuth()
@Controller('forms')
export class FormsController {
  constructor(private formsService: FormsService) {}

  // ✅ Create a new form
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new form (supports dynamic drag & drop fields)' })
  @ApiResponse({ status: 201, description: 'Form created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid form data' })
  @ApiBody({ type: CreateFormDto })
  async create(@Request() req, @Body() dto: CreateFormDto) {
    try {
      const user: User = req.user;
      return await this.formsService.createForm(user, dto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create form',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ✅ Get all forms for logged-in user
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all forms created by the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user forms' })
  async findAll(@Request() req) {
    try {
      const user: User = req.user;
      return await this.formsService.findAll(user);
    } catch (error) {
      throw new HttpException('Failed to fetch forms', HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Get form by slug (public)
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get form by slug (public access)' })
  @ApiResponse({ status: 200, description: 'Form details fetched successfully' })
  async findOneBySlug(@Param('slug') slug: string) {
    try {
      return await this.formsService.findOne(slug);
    } catch (error) {
      throw new HttpException('Form not found', HttpStatus.NOT_FOUND);
    }
  }

  // ✅ Get form by ID
  @UseGuards(JwtAuthGuard)
  @Get('id/:id')
  @ApiOperation({ summary: 'Get a specific form by ID (authenticated)' })
  @ApiResponse({ status: 200, description: 'Form details fetched successfully' })
  async findOneById(@Param('id') id: string, @Request() req) {
    try {
      const user: User = req.user;
      return await this.formsService.findById(id, user);
    } catch (error) {
      throw new HttpException('Form not found', HttpStatus.NOT_FOUND);
    }
  }

  // ✅ Update form
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update form details or structure' })
  @ApiResponse({ status: 200, description: 'Form updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateFormDto, @Request() req) {
    try {
      const user: User = req.user;
      return await this.formsService.updateForm(id, dto, user);
    } catch (error) {
      throw new HttpException('Failed to update form', HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Delete form
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete form by ID' })
  @ApiResponse({ status: 200, description: 'Form deleted successfully' })
  async remove(@Param('id') id: string, @Request() req) {
    try {
      const user: User = req.user;
      return await this.formsService.deleteForm(id, user);
    } catch (error) {
      throw new HttpException('Failed to delete form', HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Submit public response with file upload
  @Post('public/:slug/submit')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Submit a public form (supports file upload)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        formData: { type: 'object', description: 'Dynamic form JSON data' },
        files: { type: 'string', format: 'binary', description: 'Optional uploaded files' },
      },
    },
  })
  async submitPublic(
    @Param('slug') slug: string,
    @UploadedFiles() uploadedFiles: Express.Multer.File[],
    @Req() req: any,
  ) {
    try {
      const formData = req.body;
      const response = await this.formsService.submitResponseWithFiles(
        slug,
        formData,
        uploadedFiles,
      );

      if (formData.sessionId) {
        await this.formsService.deleteFormDraft(slug, formData.sessionId);
      }

      return response;
    } catch (error) {
      throw new HttpException(
        error.message || 'Form submission failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ✅ Get all responses for a form
  @UseGuards(JwtAuthGuard)
  @Get(':id/responses')
  @ApiOperation({ summary: 'Get all submitted responses for a specific form' })
  async getResponses(@Param('id') id: string, @Request() req) {
    try {
      const user: User = req.user;
      return await this.formsService.getFormResponses(id, user);
    } catch (error) {
      throw new HttpException('Failed to fetch responses', HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Get forms by current user
  @UseGuards(JwtAuthGuard)
  @Get('user/me')
  @ApiOperation({ summary: 'Get all forms created by the current user' })
  async getUserForms(@Request() req) {
    try {
      const user: User = req.user;
      return await this.formsService.getUserForms(user);
    } catch (error) {
      throw new HttpException('Failed to fetch user forms', HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Delete a specific response
  @UseGuards(JwtAuthGuard)
  @Delete('responses/:responseId')
  @ApiOperation({ summary: 'Delete a specific form response' })
  async deleteResponse(@Param('responseId') responseId: string, @Request() req) {
    try {
      const user: User = req.user;
      return await this.formsService.deleteResponse(responseId, user);
    } catch (error) {
      throw new HttpException('Failed to delete response', HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Generate QR code for a form
  @UseGuards(JwtAuthGuard)
  @Get(':id/qrcode')
  @ApiOperation({ summary: 'Generate a QR code for public form access' })
  async generateQrCode(@Param('id') id: string, @Request() req) {
    try {
      const user: User = req.user;
      return await this.formsService.generateFormQrCode(id, user);
    } catch (error) {
      throw new HttpException('Failed to generate QR code', HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Save form draft (public)
  @Post('public/:slug/draft')
  @ApiOperation({ summary: 'Save a draft response for a public form' })
  async saveDraft(
    @Param('slug') slug: string,
    @Body() body: { draftData: any; sessionId?: string },
  ) {
    try {
      return await this.formsService.saveFormDraft(slug, body.draftData, body.sessionId);
    } catch (error) {
      throw new HttpException('Failed to save draft', HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Load form draft
  @Get('public/:slug/draft')
  @ApiOperation({ summary: 'Load saved draft for a public form' })
  async loadDraft(@Param('slug') slug: string, @Body('sessionId') sessionId?: string) {
    try {
      return await this.formsService.loadFormDraft(slug, sessionId);
    } catch (error) {
      throw new HttpException('Failed to load draft', HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Delete form draft
  @Delete('public/:slug/draft')
  @ApiOperation({ summary: 'Delete saved draft for a public form' })
  async deleteDraft(@Param('slug') slug: string, @Body('sessionId') sessionId?: string) {
    try {
      await this.formsService.deleteFormDraft(slug, sessionId);
      return { message: 'Draft deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete draft', HttpStatus.BAD_REQUEST);
    }
  }
}
