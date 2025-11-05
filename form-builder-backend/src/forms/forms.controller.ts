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
  BadRequestException,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/user.entity';
// import { FilesInterceptor } from '@nestjs/platform-express';
import { AnyFilesInterceptor } from '@nestjs/platform-express';


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

  // ✅ Submit public response with file support (UPDATED)
  @Post('public/:slug/submit')
@UseInterceptors(AnyFilesInterceptor())
  async submitPublic(
    @Param('slug') slug: string,
    @UploadedFiles() uploadedFiles: Express.Multer.File[],
    @Req() req: any,
  ) {
    try {
      const formData = req.body; // now each field ID is a key
      console.log("📩 Received form data keys:", Object.keys(formData));
      console.log("📎 Uploaded files:", uploadedFiles?.map(f => f.filename));

      const response = await this.formsService.submitResponseWithFiles(
        slug,
        formData,
        uploadedFiles,
      );

      if (formData.sessionId) {
        await this.formsService.deleteFormDraft(slug, formData.sessionId);
      }

      return response;
    } catch (err) {
      console.error("❌ submitPublic error:", err);
      throw new BadRequestException(err.message || "Form submission failed");
    }
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

  // Delete response
  @UseGuards(JwtAuthGuard)
  @Delete('responses/:responseId')
  deleteResponse(@Param('responseId') responseId: string, @Request() req) {
    const user: User = req.user;
    return this.formsService.deleteResponse(responseId, user);
  }

  // Generate QR code for form
  @UseGuards(JwtAuthGuard)
  @Get(':id/qrcode')
  generateQrCode(@Param('id') id: string, @Request() req) {
    const user: User = req.user;
    return this.formsService.generateFormQrCode(id, user);
  }

  // Save form draft
  @Post('public/:slug/draft')
  async saveDraft(
    @Param('slug') slug: string,
    @Body() body: { draftData: any; sessionId?: string },
  ) {
    return this.formsService.saveFormDraft(slug, body.draftData, body.sessionId);
  }

  // Load form draft
  @Get('public/:slug/draft')
  async loadDraft(
    @Param('slug') slug: string,
    @Body('sessionId') sessionId?: string,
  ) {
    return this.formsService.loadFormDraft(slug, sessionId);
  }

  // Delete form draft
  @Delete('public/:slug/draft')
  async deleteDraft(
    @Param('slug') slug: string,
    @Body('sessionId') sessionId?: string,
  ) {
    await this.formsService.deleteFormDraft(slug, sessionId);
    return { message: 'Draft deleted successfully' };
  }
}
