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
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('forms')
export class FormsController {
  constructor(private formsService: FormsService) {}

  // Create new form
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() dto: CreateFormDto) {
    const user: User = req.user;
    return this.formsService.createForm(user, dto);
  }

  // Get all forms
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    const user: User = req.user;
    return this.formsService.findAll(user);
  }

  // Get form by slug (public)
  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.formsService.findOne(slug);
  }

  // Get form by ID
  @UseGuards(JwtAuthGuard)
  @Get('id/:id')
  findOneById(@Param('id') id: string, @Request() req) {
    const user: User = req.user;
    return this.formsService.findById(id, user);
  }

  // Update form
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFormDto, @Request() req) {
    const user: User = req.user;
    return this.formsService.updateForm(id, dto, user);
  }

  // Delete form
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const user: User = req.user;
    return this.formsService.deleteForm(id, user);
  }

  // Submit public response with file support
  @Post('public/:slug/submit')
  @UseInterceptors(FilesInterceptor('files')) // 'files' matches the FormData key from frontend
  async submitPublic(
    @Param('slug') slug: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Parse answers from string if sent as JSON
    let answers = body.answers;
    if (typeof answers === 'string') {
      answers = JSON.parse(answers);
    }

    return this.formsService.submitResponseWithFiles(slug, answers, files);
  }

  // Get form responses
  @UseGuards(JwtAuthGuard)
  @Get(':id/responses')
  getResponses(@Param('id') id: string, @Request() req) {
    const user: User = req.user;
    return this.formsService.getFormResponses(id, user);
  }

  // Get user's forms
  @UseGuards(JwtAuthGuard)
  @Get('user/me')
  getUserForms(@Request() req) {
    const user: User = req.user;
    return this.formsService.getUserForms(user);
  }

  // Generate QR code for form
  @UseGuards(JwtAuthGuard)
  @Get(':id/qrcode')
  generateQrCode(@Param('id') id: string, @Request() req) {
    const user: User = req.user;
    return this.formsService.generateFormQrCode(id, user);
  }
}
