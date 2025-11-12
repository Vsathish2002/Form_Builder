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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
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
  constructor(private formsService: FormsService) { }

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
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  ) @ApiOperation({ summary: 'Submit a public form (supports file upload)' })
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

  // ✅ ADMIN: Get all forms from all users for admn dashboard
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/all')
  @ApiOperation({ summary: 'Admin: Get all forms from all users' })
  @ApiResponse({ status: 200, description: 'List of all forms (admin only)' })
  async getAllFormsForAdmin() {
    try {
      return await this.formsService.findAllAdmin();
    } catch (error) {
      throw new HttpException('Failed to fetch admin forms', HttpStatus.BAD_REQUEST);
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
}
